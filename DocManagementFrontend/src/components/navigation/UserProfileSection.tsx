import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export function UserProfileSection() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div
      className="px-4 py-5 border-b border-blue-900/30"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-blue-500/30 shadow-lg">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white text-xl font-bold">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
            )}
          </div>
          <motion.div
            className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-[#0a1033]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.2, type: "spring" }}
          />
        </motion.div>

        <div className="text-center">
          <h3 className="text-blue-50 font-semibold text-sm">
            {user.firstName} {user.lastName}
          </h3>
          <div className="mt-1 inline-flex px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/20">
            <p className="text-blue-300 text-xs font-medium">
              {user.role || "User"}
            </p>
          </div>
        </div>

        <Link
          to="/profile"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors hover:bg-blue-800/20 px-2 py-1 rounded-md"
        >
          <Settings className="h-3 w-3" />
          <span>Manage Account</span>
        </Link>
      </div>
    </motion.div>
  );
}
