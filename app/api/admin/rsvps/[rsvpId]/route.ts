import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api/middleware/auth';
import { requireRole } from '@/lib/api/middleware/rbac';
import { successResponse, errorResponse } from '@/lib/api/utils/formatters';
import { handleApiError, NotFoundError } from '@/lib/api/utils/errors';
import { parseRequestBody } from '@/lib/api/middleware/validation';
import { sendRsvpConfirmation } from '@/lib/api/services/notification.service';

const updateApprovalSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

function applyApprovalStatus(customResponses: any, status: 'approved' | 'rejected') {
  if (customResponses && typeof customResponses === 'object' && !Array.isArray(customResponses)) {
    return {
      ...customResponses,
      approval_status: status,
    };
  }

  if (Array.isArray(customResponses)) {
    return {
      answers: customResponses,
      approval_status: status,
    };
  }

  return {
    answers: [],
    approval_status: status,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ rsvpId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    requireRole(auth, 'admin');

    const body = await parseRequestBody(request, updateApprovalSchema);
    const { rsvpId } = await params;

    const supabase = await createAdminClient();
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('id', rsvpId)
      .single();

    if (rsvpError) throw rsvpError;
    if (!rsvp) throw new NotFoundError('RSVP');

    const approvalStatus = body.action === 'approve' ? 'approved' : 'rejected';
    const nextCustomResponses = applyApprovalStatus(rsvp.custom_responses, approvalStatus);

    const { data: updated, error: updateError } = await supabase
      .from('rsvps')
      .update({
        custom_responses: nextCustomResponses,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rsvpId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    if (body.action === 'approve' && rsvp.status === 'going' && !rsvp.is_waitlisted) {
      const { data: existingTicket } = await supabase
        .from('tickets')
        .select('id')
        .eq('rsvp_id', rsvpId)
        .single();

      if (!existingTicket) {
        const qrPayload = JSON.stringify({
          rsvpId,
          userId: rsvp.user_id,
          eventId: rsvp.event_id,
          timestamp: new Date().toISOString(),
          checksum: Math.random().toString(36).slice(2, 11),
        });
        const qrCode = Buffer.from(qrPayload).toString('base64');

        const { error: ticketError } = await supabase.from('tickets').insert({
          rsvp_id: rsvpId,
          user_id: rsvp.user_id,
          event_id: rsvp.event_id,
          qr_code: qrCode,
          check_in_status: 'not_checked_in',
        });

        if (ticketError) throw ticketError;
      }

      try {
        await sendRsvpConfirmation(rsvpId);
      } catch (notificationError) {
        console.error('[v0] Failed to send RSVP approval notification:', notificationError);
      }
    }

    if (body.action === 'reject') {
      await supabase.from('tickets').delete().eq('rsvp_id', rsvpId);
    }

    return successResponse(
      {
        rsvp: {
          ...updated,
          approval_status: approvalStatus,
        },
      },
      `RSVP ${approvalStatus} successfully`
    );
  } catch (error) {
    const { status, body } = handleApiError(error);
    return errorResponse(
      body.error.code,
      body.error.message,
      status,
      body.error.details
    );
  }
}
