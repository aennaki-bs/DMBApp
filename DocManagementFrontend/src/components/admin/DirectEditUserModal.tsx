import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserDto, UpdateUserRequest } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { X, UserCog, Save, User, Building2, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";
import responsibilityCentreService from "@/services/responsibilityCentreService";

interface DirectEditUserModalProps {
  user: UserDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: number, data: UpdateUserRequest) => Promise<void>;
}

export function DirectEditUserModal({
  user,
  isOpen,
  onClose,
  onSave,
}: DirectEditUserModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<{
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isEmailConfirmed: boolean;
    roleName: string;
    isActive: boolean;
    responsibilityCenterId: number;
    city: string;
    country: string;
    address: string;
    identity: string;
    phoneNumber: string;
  }>({
    username: "",
    passwordHash: "",
    firstName: "",
    lastName: "",
    isEmailConfirmed: false,
    roleName: "SimpleUser",
    isActive: true,
    responsibilityCenterId: 0,
    city: "",
    country: "",
    address: "",
    identity: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [responsibilityCentres, setResponsibilityCentres] = useState<ResponsibilityCentreSimple[]>([]);

  // Detect user type based on name patterns
  const detectUserType = (user: UserDto): "personal" | "company" => {
    if (!user.lastName ||
      user.firstName.toLowerCase().includes('company') ||
      user.firstName.toLowerCase().includes('corp') ||
      user.firstName.toLowerCase().includes('ltd') ||
      user.firstName.toLowerCase().includes('inc') ||
      user.firstName.toLowerCase().includes('llc') ||
      user.firstName.toLowerCase().includes('enterprise') ||
      user.firstName.toLowerCase().includes('group') ||
      user.firstName.toLowerCase().includes('organization') ||
      user.firstName.toLowerCase().includes('business')) {
      return "company";
    }
    return "personal";
  };

  const userType = user ? detectUserType(user) : "personal";

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      const roleString =
        typeof user.role === "string"
          ? user.role
          : (user.role as any)?.roleName || "SimpleUser";
      
      const responsibilityCentreId = (user as any).responsibilityCentreId || 0;
      console.log("Setting responsibility centre ID:", responsibilityCentreId);
      
      const newFormData = {
        username: user.username || "",
        passwordHash: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        isEmailConfirmed: user.isEmailConfirmed || false,
        roleName: roleString,
        isActive: user.isActive || false,
        responsibilityCenterId: responsibilityCentreId,
        city: (user as any).city || "",
        country: (user as any).country || "",
        address: (user as any).address || "",
        identity: (user as any).identity || "",
        phoneNumber: (user as any).phoneNumber || "",
      };
      
      console.log("Setting form data with responsibility centre ID:", newFormData.responsibilityCenterId);
      setFormData(newFormData);
      setUsernameError("");
    }
  }, [user]);

  // Fetch responsibility centres when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchResponsibilityCentres = async () => {
        try {
          const data = await responsibilityCentreService.getSimple();
          setResponsibilityCentres(data || []);
        } catch (error) {
          console.error("Failed to fetch responsibility centres:", error);
          setResponsibilityCentres([]);
        }
      };
      fetchResponsibilityCentres();
    }
  }, [isOpen]);

  // Debounced username availability check
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (
      formData.username &&
      formData.username.length >= 3 &&
      user &&
      formData.username !== user.username
    ) {
      setUsernameAvailable(null);
      setUsernameChecking(true);
      timeoutId = setTimeout(async () => {
        try {
          const isAvailable = await (window as any).authService?.validateUsername
            ? await (window as any).authService.validateUsername(formData.username)
            : await import("@/services/authService").then(m => m.default.validateUsername(formData.username));
          setUsernameAvailable(isAvailable);
        } catch (error) {
          setUsernameAvailable(false);
        } finally {
          setUsernameChecking(false);
        }
      }, 500);
    } else {
      setUsernameAvailable(null);
      setUsernameChecking(false);
    }
    return () => clearTimeout(timeoutId);
  }, [formData.username, user]);

  if (!isOpen || !user) return null;

  const validateUsername = (username: string): boolean => {
    if (username.trim().length < 3) {
      setUsernameError(t("userManagement.usernameMinLength"));
      return false;
    }
    if (username.includes(" ")) {
      setUsernameError(t("userManagement.usernameNoSpaces"));
      return false;
    }
    setUsernameError("");
    return true;
  };

  // Password validation function
  const validatePassword = (password: string): string => {
    if (!password) return "";
    if (password.length < 8) return t("userManagement.passwordMinLength");
    if (!/[A-Z]/.test(password)) return t("userManagement.passwordUppercase");
    if (!/[a-z]/.test(password)) return t("userManagement.passwordLowercase");
    if (!/[0-9]/.test(password)) return t("userManagement.passwordNumber");
    if (!/[^A-Za-z0-9]/.test(password)) return t("userManagement.passwordSpecialChar");
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "username") validateUsername(value);
    if (name === "passwordHash") setPasswordError(validatePassword(value));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateUsername(formData.username)) {
      toast.error(t("userManagement.pleaseFixErrors"));
      return;
    }
    if (
      formData.username !== user.username &&
      (usernameAvailable === false || usernameChecking)
    ) {
      toast.error(t("userManagement.usernameTaken"));
      return;
    }
    if (formData.passwordHash && passwordError) {
      toast.error(passwordError);
      return;
    }
    setIsSubmitting(true);
    const updateData: UpdateUserRequest = {};
    if (formData.username !== user.username) updateData.username = formData.username;
    if (formData.passwordHash) updateData.passwordHash = formData.passwordHash;
    if (formData.firstName !== user.firstName) updateData.firstName = formData.firstName;
    if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
    if (formData.isEmailConfirmed !== user.isEmailConfirmed) updateData.isEmailConfirmed = formData.isEmailConfirmed;
    if (formData.roleName !== (typeof user.role === "string" ? user.role : (user.role as any)?.roleName)) updateData.roleName = formData.roleName as any;
    if (formData.isActive !== user.isActive) updateData.isActive = formData.isActive;
    if ((formData.responsibilityCenterId || 0) !== ((user as any).responsibilityCenterId || 0)) updateData.responsibilityCenterId = formData.responsibilityCenterId;
    if (formData.city !== (user as any).city) updateData.city = formData.city;
    if (formData.country !== (user as any).country) updateData.country = formData.country;
    if (formData.address !== (user as any).address) updateData.address = formData.address;
    if (formData.identity !== (user as any).identity) updateData.identity = formData.identity;
    if (formData.phoneNumber !== (user as any).phoneNumber) updateData.phoneNumber = formData.phoneNumber;
    if (Object.keys(updateData).length === 0) {
      toast.info(t("userManagement.noChanges"));
      onClose();
      return;
    }
    try {
      await onSave(user.id, updateData);
      toast.success(t("userManagement.userUpdatedSuccess"));
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error(t("userManagement.failedToUpdateUser"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create portal to render outside of component hierarchy
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md md:max-w-xl bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] rounded-xl border border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] overflow-hidden">
        <div className="p-4 border-b border-blue-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-400">
              <UserCog className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-blue-100">{t("userManagement.editUser")}</h2>
            <span className="text-xs bg-blue-800/40 px-2 py-1 rounded-full text-blue-300 ml-2">
              {userType === "personal" ? t("userManagement.personalAccount") : t("userManagement.companyAccount")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-blue-100 rounded-full p-1 hover:bg-blue-800/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 max-h-[80vh] overflow-y-auto"
        >
          <div className="space-y-5">
            {/* User Information */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <div className="flex items-center gap-2 mb-3">
                {userType === "personal" ? (
                  <User className="h-5 w-5 text-blue-400" />
                ) : (
                  <Building2 className="h-5 w-5 text-blue-400" />
                )}
                <h3 className="text-blue-100 font-medium">
                  {userType === "personal" ? t("userManagement.personalInformation") : t("userManagement.companyInformation")}
                </h3>
              </div>
              
              {userType === "personal" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-blue-200">{t("userManagement.firstName")}</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-[#111633] border-blue-900/50 text-white"
                      placeholder={t("userManagement.firstNamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-blue-200">{t("userManagement.lastName")}</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-[#111633] border-blue-900/50 text-white"
                      placeholder={t("userManagement.lastNamePlaceholder")}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-blue-200">{t("userManagement.companyName")}</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-[#111633] border-blue-900/50 text-white"
                      placeholder={t("userManagement.companyNamePlaceholder")}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-blue-400" />
                <h3 className="text-blue-100 font-medium">{t("userManagement.accountInformation")}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.username")}</label>
                  <div className="relative flex items-center">
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`bg-[#111633] border-blue-900/50 text-white pr-10 ${usernameError || (usernameAvailable === false) ? "border-red-500" : usernameAvailable === true ? "border-green-500" : ""}`}
                      placeholder={t("userManagement.usernamePlaceholder")}
                    />
                    {usernameChecking && (
                      <Loader2 className="animate-spin absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                    )}
                    {usernameAvailable === true && !usernameChecking && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 text-xs">Available</span>
                    )}
                    {usernameAvailable === false && !usernameChecking && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 text-xs">Taken</span>
                    )}
                  </div>
                  {usernameError && (
                    <p className="text-red-400 text-xs mt-1">{usernameError}</p>
                  )}
                  {formData.username !== user?.username && usernameAvailable === false && !usernameChecking && (
                    <p className="text-red-400 text-xs mt-1">{t("userManagement.usernameTaken")}</p>
                  )}
                  {formData.username !== user?.username && usernameAvailable === true && !usernameChecking && (
                    <p className="text-green-400 text-xs mt-1">{t("userManagement.usernameAvailable")}</p>
                  )}
                </div>

                {/* Email field - Read only */}
                <div className="space-y-2">
                  <label className="text-sm text-blue-200 flex items-center gap-2">
                    {t("userManagement.emailAddress")}
                    <Lock className="h-3 w-3 text-gray-400" />
                  </label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-[#0a1033] border-blue-900/30 text-gray-400 cursor-not-allowed"
                    placeholder="Email cannot be edited"
                  />
                  <p className="text-xs text-gray-400">
                    {t("userManagement.emailCannotBeModified")}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.password")}</label>
                  <div className="relative flex items-center">
                    <Input
                      name="passwordHash"
                      value={formData.passwordHash}
                      onChange={handleInputChange}
                      className={`bg-[#111633] border-blue-900/50 text-white pr-10 ${passwordError ? "border-red-500" : ""}`}
                      type={showPassword ? "text" : "password"}
                      placeholder={t("userManagement.enterNewPassword")}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-100"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.passwordHash && passwordError && (
                    <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                  )}
                  {formData.passwordHash && !passwordError && (
                    <p className="text-green-400 text-xs mt-1">Password is valid</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Details */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-blue-400" />
                <h3 className="text-blue-100 font-medium">{t("userManagement.contactAndDetails")}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.city")}</label>
                  <Input name="city" value={formData.city} onChange={handleInputChange} className="bg-[#111633] border-blue-900/50 text-white" placeholder={t("userManagement.cityPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.country")}</label>
                  <Input name="country" value={formData.country} onChange={handleInputChange} className="bg-[#111633] border-blue-900/50 text-white" placeholder={t("userManagement.countryPlaceholder")} />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.address")}</label>
                  <Input name="address" value={formData.address} onChange={handleInputChange} className="bg-[#111633] border-blue-900/50 text-white" placeholder={t("userManagement.addressPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.phoneNumber")}</label>
                  <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="bg-[#111633] border-blue-900/50 text-white" placeholder={t("userManagement.phoneNumberPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.identityCIN")}</label>
                  <Input name="identity" value={formData.identity} onChange={handleInputChange} className="bg-[#111633] border-blue-900/50 text-white" placeholder={t("userManagement.enterCINOrIdentity")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.responsibilityCentre")}</label>
                  <Select
                    value={formData.responsibilityCenterId?.toString() || "0"}
                    onValueChange={(value) =>
                      handleSelectChange("responsibilityCenterId", parseInt(value) || 0)
                    }
                  >
                    <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white">
                      <SelectValue placeholder={t("userManagement.selectResponsibilityCentre")} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2c6b] border-blue-900/50 text-white">
                      <SelectItem value="0">{t("userManagement.noResponsibilityCentre")}</SelectItem>
                      {responsibilityCentres.map((centre) => (
                        <SelectItem key={centre.id} value={centre.id.toString()}>
                          {centre.code} - {centre.descr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <h3 className="text-blue-100 font-medium mb-3">
                {t("userManagement.roleAndPermissions")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-blue-200">{t("userManagement.role")}</label>
                  <Select
                    value={formData.roleName}
                    onValueChange={(value) =>
                      handleSelectChange("roleName", value)
                    }
                  >
                    <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2c6b] border-blue-900/50 text-white">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="FullUser">Full User</SelectItem>
                      <SelectItem value="SimpleUser">Simple User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-blue-900/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20"
            >
              {t("userManagement.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!usernameError}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("userManagement.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
