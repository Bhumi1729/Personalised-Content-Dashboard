'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppDispatch } from '../../hooks/redux';
import { setUser, clearUser } from '../../store/authSlice';

const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      dispatch(setUser({
        id: (session.user as { id: string }).id,
        email: session.user.email || '',
        name: session.user.name || '',
        image: session.user.image,
      }));
    } else {
      dispatch(clearUser());
    }
  }, [session, status, dispatch]);

  return <>{children}</>;
};

export default SessionManager;
