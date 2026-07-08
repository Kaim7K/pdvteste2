import { RoleName } from "@prisma/client";

export const PermissionKeys = {
  salesCreate: "sales:create",
  salesViewOwn: "sales:view-own",
  salesViewAll: "sales:view-all",
  salesCancelOwn: "sales:cancel-own",
  salesCancelAll: "sales:cancel-all",
  productsManage: "products:manage",
  stockManage: "stock:manage",
  creditOwn: "credit:own",
  creditAll: "credit:all",
  auditsProduct: "audits:product",
  auditsAll: "audits:all",
  reportsView: "reports:view",
  usersManage: "users:manage",
  settingsManage: "settings:manage"
} as const;

export type PermissionKey = typeof PermissionKeys[keyof typeof PermissionKeys];

const sellerPermissions: PermissionKey[] = [
  PermissionKeys.salesCreate,
  PermissionKeys.salesViewOwn,
  PermissionKeys.salesCancelOwn,
  PermissionKeys.productsManage,
  PermissionKeys.stockManage,
  PermissionKeys.creditOwn,
  PermissionKeys.auditsProduct
];

const managerPermissions: PermissionKey[] = Object.values(PermissionKeys);

export function roleHasPermission(role: RoleName, permission: PermissionKey) {
  if (role === RoleName.MANAGER) return managerPermissions.includes(permission);
  return sellerPermissions.includes(permission);
}
