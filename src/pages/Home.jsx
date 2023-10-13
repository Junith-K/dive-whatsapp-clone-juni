import { signOut } from 'firebase/auth';
import React, {useState, useEffect, useRef} from 'react'
import { auth, database } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { push, ref, set, update, onValue, get } from 'firebase/database';
import generateRoomId from '../utils/roomid';
import debounce from "../utils/debounce"

const Home = () => {

  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const [usersData, setUsersData] = useState({});
  const [selectedUser, setSelectedUser] = useState({});
  const [message, changeMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const hidden = useRef(null);
  const [wasVisible,setWasVisible] = useState(true)
  const scrollableDivRef = useRef(null);

  useEffect(() => {
    // Ensure that the ref is not null before accessing its properties
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
    }
  }, [selectedUser, messages]);



  useEffect(() => {

    const userRef = ref(database, `users/${user.uid}`);
    update(userRef, {
      online: true,
    }); 
    const usersRef = ref(database, 'users');

    const handleDataChange = (snapshot) => {
      const data = snapshot.val();
      const sortedUsers = Object.values(data)
      .filter(usesr => usesr.uid != user.uid) // Exclude the current user
      .sort((a, b) => {
        if (a.online && !b.online) {
          return -1;
        } else if (!a.online && b.online) {
          return 1;
        } else {
          return 0;
        }
      });
      setUsersData(sortedUsers);
    };

    const unsubscribe = onValue(usersRef, handleDataChange);

    return () => {
      unsubscribe();
    };
  }, []); 

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setWasVisible(false)
      console.log('Page is hidden');
    } else {
      setWasVisible(true)
      console.log('Page is visible');
    }
  };

  useEffect(() => {
    hidden.current = handleVisibilityChange;

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  

  useEffect(() => {
    const updateMessagesStatus = async () => {
      if (selectedUser) {
        for (let i = 0; i < messages.length; i++) {
          if (messages[i]["roomId"] === generateRoomId(user.uid, selectedUser.uid)) {
            for (let j = 0; j < messages[i]["messages"].length; j++) {
              const messageRef = ref(database, `messages/${messages[i]["roomId"]}/${messages[i]["messages"][j]["messageId"]}`);
              if ((messages[i]["messages"][j]["status"] === "sent" || messages[i]["messages"][j]["status"] === "delivered") && messages[i]["messages"][j]["sentBy"]!=user.uid) {
                await update(messageRef, {
                  status: "read"
                });
              }
            }
          }
        }
      }
    };
  
    updateMessagesStatus();
  }, [selectedUser, wasVisible]);
  
  useEffect(() => {
    if (!user) {
      return;
    }

    const userMessagesRef = ref(database, 'messages');
    var userRoomMessages;
    const unsubscribe = onValue(userMessagesRef, async(snapshot) => {
      const data = await snapshot.val();

      userRoomMessages = Object.entries(data || {})
        .filter(([roomId]) => roomId.includes(user.uid))
        .map(([roomId, messages]) => ({ roomId, messages: Object.values(messages) }));

      setMessages(userRoomMessages);
      for(let i = 0; i<userRoomMessages.length;i++){
        for(let j = 0;j<userRoomMessages[i]["messages"].length;j++){
          const messageRef = ref(database,`messages/${userRoomMessages[i]["roomId"]}/${userRoomMessages[i]["messages"][j]["messageId"]}`);
          if(userRoomMessages[i]["messages"][j]["status"] === "sent" && userRoomMessages[i]["messages"][j]["sentBy"]!=user.uid){
            await update(messageRef,{
              status:"delivered"
            })
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const userRef = ref(database, `users/${auth.currentUser.uid}`);
      update(userRef, {
        online: false,
      });
      auth.signOut()
      .then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .catch((error) => {
        console.error('Logout Error:', error.message);
      });
      
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }

  const changeUser = (userId) => {
    setSelectedUser(usersData[userId])
  }


  const sendMessage = async () => {
    if(message==""){
      return;
    }
    try {
      const roomid = generateRoomId(selectedUser.uid, user.uid);
      const messageRef = ref(database, `messages/${roomid}`);
      const newMessageId = push(messageRef).key; // Generate a unique ID for the message
      const newMessage = {
        messageId: newMessageId,
        text: message,
        status: 'sent',
        sentBy: user.uid,
      };
      await set(ref(database, `messages/${roomid}/${newMessageId}`), newMessage);
      changeMessage("")
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
};

  return (
    <div className='flex flex-col bg-gray-300 h-[100vh]'>
      <div className='flex h-[10%] justify-between items-center mx-6 my-3'>
        <div className='text-xl text-green-500 cursor-pointer bg-white px-4 py-2' onClick={()=>{setSelectedUser({})}}>Whatsapp Clone</div>
        <div className='flex justify-center items-center gap-3'>
          <div className='text-xl'>{user.displayName}</div>
          <button onClick={handleLogout} className='bg-green-400 cursor-pointer text-white px-4 py-2'>Logout</button>
        </div>
      </div>
      <div className='flex mb-3 h-[90%]'>
        <div className='w-1/3 bg-white border-r-2 border-black'>
          {Object.entries(usersData).map(([userId, userData]) => {
              if(userId!=user.uid){
                return <div className={`px-6 py-4 flex justify-between items-center cursor-pointer bg-gray-300 border-black border-[1px] hover:bg-gray-400 ${selectedUser.username==userData.username?"bg-gray-400 hover:bg-gray-400":""}`} key={userId} onClick={()=>{changeUser(userId)}}>
                  <p>{userData.username}</p>
                  <div className={`w-2 h-2 rounded-full ${userData.online?"bg-green-600":"bg-gray-100"}`}></div>
                </div>
              }
            })}
        </div>
        <div className='w-3/4 max-h-[100%] bg-green-200'>
          {selectedUser.uid?
          (<>
          <div className='max-h-[95%] h-[95%]'>
            <div className='flex justify-center py-3 text-xl bg-gray-400'>{selectedUser.username}</div>
            <div ref={scrollableDivRef} className='h-[90%] overflow-scroll overflow-x-hidden'>
              {messages.find(tmp => tmp.roomId==generateRoomId(user.uid,selectedUser.uid)) && messages.find(tmp => tmp.roomId==generateRoomId(user.uid,selectedUser.uid))["messages"].map((item)=>{
                return <div className={`m-4 g mb-0 flex ${item.sentBy==user.uid?"justify-end":""}`}>
                <div className='bg-white rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-xl px-4 py-2 w-fit '> 
                  <div>{item.text}</div>
                  <div className={`flex justify-end text-xs items-center ${item.sentBy==user.uid?"":"hidden"}`}>{item.status}<img width={20} height={20} src={`/${item.status}.png`} className='ml-1'/></div>
                </div>      
              </div>
              })}
            </div>
          </div>
          <div className='h-[5%] flex'>
            <input className='flex-grow h-full pl-2' type='text' placeholder='Enter Message...' value={message} onChange={(e)=>{changeMessage(e.target.value)}}/>
            <div onClick={sendMessage} className='bg-green-400 cursor-pointer text-white px-4 py-2 self-center'>Send</div>
          </div>
          </>):<div className='self-center'>
            Select a Person</div>}
        </div>
      </div>
    </div>
  )
}

export default Home