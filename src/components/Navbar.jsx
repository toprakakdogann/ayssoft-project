import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import {
  FiHome,
  FiShoppingCart,
  FiLogOut,
  FiLogIn,
  FiUser,
  FiChevronDown,
  FiShield,
} from "react-icons/fi";

export default function Navbar() {
  const { auth, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef(null);

  const role = auth?.user?.role;
  const isAuthed = !!auth;

  const fullName =
    auth?.user?.firstName && auth?.user?.lastName
      ? `${auth.user.firstName} ${auth.user.lastName}`
      : auth?.user?.username;

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"
    }`;

  function handleLogout() {
    logout?.();
    setOpenProfile(false);
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    function onDown(e) {
      if (!openProfile) return;
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    }

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openProfile]);

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <div className="font-semibold tracking-wide text-gray-900">AYSSOFT</div>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass}>
            <FiHome />
            Ana Sayfa
          </NavLink>

          {role === "user" && (
            <NavLink to="/cart" className={linkClass}>
              <FiShoppingCart />
              <span className="inline-flex items-center gap-2">
                Sepetim
                {count > 0 && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {count}
                  </span>
                )}
              </span>
            </NavLink>
          )}

          {isAuthed ? (
            <div ref={profileRef} className="relative ml-2">
              <button
                onClick={() => setOpenProfile((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <FiUser />
                </div>

                <span className="hidden sm:block font-medium">
                  {auth.user.username}
                </span>

                <FiChevronDown className="text-gray-500" />
              </button>

              {openProfile && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="border-b px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      @{auth.user.username}
                    </div>
                  </div>

                  <div className="px-4 py-2 text-sm text-gray-700 flex items-center gap-2">
                    <FiShield className="text-gray-500" />
                    Rol: <span className="font-medium capitalize">{role}</span>
                  </div>

                  <div className="border-t p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <FiLogOut />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className={linkClass}>
              <FiLogIn />
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
