import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconLoader2 } from "@tabler/icons-react";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";
import { asyncLogout } from "../../auth/states/action";
import { asyncGetProfile } from "../../users/states/action";

// Route guard: tanpa token -> login; token tidak valid -> sesi dibersihkan.
export default function LostFoundLayout() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkedToken, setCheckedToken] = useState(null);

  useEffect(() => {
    if (!token) return;

    let active = true;
    dispatch(asyncGetProfile()).then((valid) => {
      if (!active) return;
      if (!valid) {
        dispatch(asyncLogout());
        return;
      }
      setCheckedToken(token);
    });

    return () => {
      active = false;
    };
  }, [token, dispatch]);

  const closeDrawer = () => setDrawerOpen(false);

  if (!token) return <Navigate to="/auth/login" replace />;

  if (checkedToken !== token) {
    return (
      <div className="min-h-screen lg:pl-72">
        <SidebarComponent open={drawerOpen} onClose={closeDrawer} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
          <h1 className="sr-only">Pusat Lost &amp; Found</h1>
          <p role="status" className="flex items-center justify-center gap-3 py-24 font-semibold text-indigo-950">
            <IconLoader2 className="animate-spin" /> Memuat sesi…
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:pl-72">
      <SidebarComponent open={drawerOpen} onClose={closeDrawer} />
      <NavbarComponent onOpenMenu={() => setDrawerOpen(true)} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
