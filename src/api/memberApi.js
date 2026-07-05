import api from "./axios";

export const withdrawMember = (password, bookPolicy) =>
  api.delete("/api/members/me", { data: { password, bookPolicy } });
