/**
 * Simplified Dependency Injection Container
 */
import { db } from "~/db/index";
import { LoginService } from "./login.server";
import { LogoutService } from "./logout.server";
import { RBACService } from "./rbac.server";
import { RegistrationService } from "./register.server";
import { SessionsRepository } from "./repos/sessions.repo";
import { UsersRepository } from "./repos/users.repo";
import { SecurityService } from "./security.server";
import { SessionService } from "./session.service";
import { AuthValidators } from "./validators.server";

class AuthServiceContainer {
  // Repositories
  private _sessionsRepo: SessionsRepository | null = null;
  private _usersRepo: UsersRepository | null = null;

  // Core services
  private _securityService: SecurityService | null = null;
  private _authValidators: AuthValidators | null = null;
  private _sessionService: SessionService | null = null;

  // Business services
  private _loginService: LoginService | null = null;
  private _logoutService: LogoutService | null = null;
  private _registrationService: RegistrationService | null = null;
  private _rbacService: RBACService | null = null;

  get sessionsRepo(): SessionsRepository {
    if (!this._sessionsRepo) {
      this._sessionsRepo = new SessionsRepository(db);
    }
    return this._sessionsRepo;
  }

  get usersRepo(): UsersRepository {
    if (!this._usersRepo) {
      this._usersRepo = new UsersRepository(db);
    }
    return this._usersRepo;
  }

  get securityService(): SecurityService {
    if (!this._securityService) {
      this._securityService = new SecurityService();
    }
    return this._securityService;
  }

  get authValidators(): AuthValidators {
    if (!this._authValidators) {
      this._authValidators = new AuthValidators();
    }
    return this._authValidators;
  }

  get sessionService(): SessionService {
    if (!this._sessionService) {
      this._sessionService = new SessionService(this.sessionsRepo);
    }
    return this._sessionService;
  }

  get loginService(): LoginService {
    if (!this._loginService) {
      this._loginService = new LoginService(
        this.usersRepo,
        this.authValidators,
        this.securityService,
        this.sessionService
      );
    }
    return this._loginService;
  }

  get logoutService(): LogoutService {
    if (!this._logoutService) {
      this._logoutService = new LogoutService(this.sessionService);
    }
    return this._logoutService;
  }

  get registrationService(): RegistrationService {
    if (!this._registrationService) {
      this._registrationService = new RegistrationService(
        this.usersRepo,
        this.authValidators,
        this.securityService,
        this.sessionService
      );
    }
    return this._registrationService;
  }

  get rbacService(): RBACService {
    if (!this._rbacService) {
      this._rbacService = new RBACService(this.sessionService);
    }
    return this._rbacService;
  }
}

export const authContainer = new AuthServiceContainer();
