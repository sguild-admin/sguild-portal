// modules/super-admin/index.ts

export { superAdminService } from "./super-admin.service"
export { superAdminRepo } from "./super-admin.repo"

export {
  superAdminSchemas,
  type CreateUserInput,
  type ListUsersInput,
  type CreateOrgInput,
  type ListOrgsInput,
} from "./super-admin.schema"

export {
  toSuperAdminUserDto,
  toSuperAdminOrgDto,
  type SuperAdminUserDto,
  type SuperAdminOrgDto,
} from "./super-admin.dto"
