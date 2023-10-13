import { Outlet } from 'react-router-dom';
import './App.css';
import { useEffect } from 'react';
import { auth, database } from './firebase';
import { ref, update } from 'firebase/database';

function App() {

  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userRef = ref(database, `users/${currentUser.uid}`);
          await update(userRef, {
            online: false,
          });
        }
      } catch (error) {
        console.error('Error updating online status:', error.message);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="App">
      <Outlet />
    </div>
  );
}

export default App;
