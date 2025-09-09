/**
 * Simplified role-based access control (RBAC)
 */
import { redirect } from 'react-router';
import type { SessionService } from './session.service';
import type { User } from './validators.server';

export enum UserRole {
  OWNER = 'OWNER',
  WORKER = 'WORKER'
}

export class RBACService {
  constructor(private sessionService: SessionService) {}

  /**
   * Check if user has specific role
   */
  private checkRole(user: User, requiredRole: UserRole): boolean {
    return user.role === requiredRole;
  }

  /**
   * Check if user is owner
   */
  isOwner(user: User): boolean {
    return this.checkRole(user, UserRole.OWNER);
  }

  /**
   * Check if user is worker
   */
  isWorker(user: User): boolean {
    return this.checkRole(user, UserRole.WORKER);
  }

  /**
   * Require owner role or redirect
   */
  async requireOwner(request: Request, redirectTo: string = '/unauthorized') {
    const session = await this.sessionService.getSession(request);

    if (!session?.user) {
      throw redirect('/auth/login');
    }

    if (!this.isOwner(session.user)) {
      throw redirect(redirectTo);
    }

    return session;
  }

  /**
   * Require worker role or redirect
   */
  async requireWorker(request: Request, redirectTo: string = '/unauthorized') {
    const session = await this.sessionService.getSession(request);

    if (!session?.user) {
      throw redirect('/auth/login');
    }

    if (!this.isWorker(session.user)) {
      throw redirect(redirectTo);
    }

    return session;
  }
}