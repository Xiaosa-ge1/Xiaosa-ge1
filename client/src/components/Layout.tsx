import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  ListTodo,
  CircleCheck,
  MessageCircle,
  MoreHorizontal,
  BookOpen,
  Camera,
  Bookmark,
} from 'lucide-react';

const mainTabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/plans', label: '计划', icon: ListTodo },
  { path: '/checkin', label: '打卡', icon: CircleCheck },
  { path: '/ai-chat', label: 'AI', icon: MessageCircle },
];

const moreItems = [
  { path: '/diary', label: '日记', icon: BookOpen },
  { path: '/photo-wall', label: '照片墙', icon: Camera },
  { path: '/favorites', label: '收藏', icon: Bookmark },
];

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreItems.some((item) => pathname === item.path);

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-auto pb-16">
        <div className="max-w-lg mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {showMore && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-16 left-0 right-0 bg-background border-t border-border">
            <div className="max-w-lg mx-auto px-4 py-3 flex justify-around">
              {moreItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center gap-1 py-1 px-3"
                  >
                    <item.icon
                      className="size-5"
                      strokeWidth={isActive ? 2.5 : 1.5}
                      color={isActive ? 'hsl(0 0% 7%)' : 'hsl(0 0% 55%)'}
                    />
                    <span
                      className="text-xs"
                      style={{
                        color: isActive ? 'hsl(0 0% 7%)' : 'hsl(0 0% 55%)',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="max-w-lg mx-auto flex justify-around items-center h-14">
          {mainTabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              >
                <tab.icon
                  className="size-5"
                  strokeWidth={isActive ? 2.5 : 1.5}
                  color={isActive ? 'hsl(0 0% 7%)' : 'hsl(0 0% 55%)'}
                />
                <span
                  className="text-[10px] leading-tight"
                  style={{
                    color: isActive ? 'hsl(0 0% 7%)' : 'hsl(0 0% 55%)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
          >
            <MoreHorizontal
              className="size-5"
              strokeWidth={isMoreActive ? 2.5 : 1.5}
              color={isMoreActive ? 'hsl(0 0% 7%)' : 'hsl(0 0% 55%)'}
            />
            <span
              className="text-[10px] leading-tight"
              style={{
                color: isMoreActive ? 'hsl(0 0% 7%)' : 'hsl(0 0% 55%)',
                fontWeight: isMoreActive ? 600 : 400,
              }}
            >
              更多
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
