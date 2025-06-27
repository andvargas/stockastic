export const hasPermission = (user, requiredRoles) => {
  if (!user) return false;
  return requiredRoles.includes(user.role);
};