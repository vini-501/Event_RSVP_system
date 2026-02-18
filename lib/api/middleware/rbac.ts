import { ForbiddenError } from '../utils/errors';
import { AuthContext } from './auth';

export type Role = 'admin' | 'organizer' | 'attendee';

const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  organizer: 2,
  attendee: 1,
};

export function requireRole(auth: AuthContext, requiredRoles: Role[] | Role): void {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  const userRole = auth.role as Role;
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  
  const hasPermission = roles.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role] || 0;
    return userLevel >= requiredLevel;
  });

  if (!hasPermission) {
    throw new ForbiddenError(
      `This action requires one of the following roles: ${roles.join(', ')}`
    );
  }
}

export function requireResourceOwnership(
  auth: AuthContext,
  resourceOwnerId: string
): void {
  if (auth.userId !== resourceOwnerId && auth.role !== 'admin') {
    throw new ForbiddenError('You do not have permission to access this resource');
  }
}

export function isAdmin(auth: AuthContext): boolean {
  return auth.role === 'admin';
}

export function isOrganizer(auth: AuthContext): boolean {
  return auth.role === 'organizer' || auth.role === 'admin';
}

export function isAttendee(auth: AuthContext): boolean {
  return true; // All users are attendees
}
