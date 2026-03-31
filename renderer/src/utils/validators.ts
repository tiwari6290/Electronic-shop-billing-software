export const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const isMobile = (v: string) =>
  /^[0-9]{10}$/.test(v);

export const validateLoginForm = ({
  role,
  branch,
  username,
  password,
}: {
  role: string;
  branch: string;
  username: string;
  password: string;
}) => {
  if (!role) return "Please select a role";
  if (!branch) return "Please select a branch";
  if (!username) return "Email or mobile is required";
  if (!password) return "Password is required";

  if (isEmail(username) || isMobile(username)) return null;

  return "Enter valid email or 10 digit mobile number";
};

