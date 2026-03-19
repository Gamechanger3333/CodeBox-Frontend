"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/main/ChatWindow';
import ConversationsList from '@/components/main/ConversationsList';
import Logout from './Logout';
import NavigationButtons from './NavigationButtons';
import api from '@/app/api';

const MainBody = () => {
  const [conversationId, setConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: () => api.get('/check_authentication').then(r => r.data),
    retry: false,
    onError: () => {},
  });

  const authenticated = !!authData;

  useQuery({
  queryKey: ['latestConversation'],
  queryFn: () => api.get('/latest_conversation').then(r => r.data),
  enabled: authenticated,
  retry: false,
  refetchOnWindowFocus: false, // ✅ stop refetching on tab focus
  onSuccess: (data) => {
    if (data?.conversationId) setConversationId(data.conversationId);
  },
  onError: (error) => {
    if (error?.response?.status !== 404) {
      console.error('Error fetching latest conversation:', error);
    }
  },
});

  const newChatMutation = useMutation({
    mutationFn: () => api.post('/start_conversation', {}),
    onSuccess: (response) => {
      const newId = response.data.conversationId;
      setConversationId(newId);
      queryClient.invalidateQueries(['conversations']);
      setSidebarOpen(false);
      toast.success('New chat started!');
    },
    onError: () => toast.error('Failed to start new chat'),
  });

  const handleLogout = async () => {
    try {
      await api.get('/logout');
      Cookies.remove('token');
      queryClient.clear();
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  // Called by ChatWindow when it auto-creates a conversation
  const handleConversationCreated = (newId) => {
    setConversationId(newId);
    queryClient.invalidateQueries(['conversations']);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[#adadb8] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900">
          <svg viewBox="0 0 24 24" className="w-9 h-9 fill-white">
            <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white text-center">Welcome to CodeBox</h1>
        <p className="text-[#adadb8] text-center">Sign in to start chatting</p>
        <NavigationButtons />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0e0e10] flex overflow-hidden">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-60 bg-[#18181b] border-r border-[#3d3d3f] flex flex-col z-30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-4 border-b border-[#3d3d3f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
              </svg>
            </div>
            <span className="text-white font-bold">CodeBox</span>
          </div>
          <button className="md:hidden text-[#adadb8] hover:text-white" onClick={() => setSidebarOpen(false)}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="p-3">
          <button onClick={() => newChatMutation.mutate()} disabled={newChatMutation.isLoading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white rounded-lg px-4 py-2 text-sm font-medium transition">
            <FontAwesomeIcon icon={faPlusCircle} />
            {newChatMutation.isLoading ? 'Creating...' : 'New Chat'}
          </button>
        </div>

        <div className="flex-1 overflow-hidden px-2">
          <p className="text-[#6b6b7b] text-xs font-semibold uppercase tracking-wider px-2 mb-2">Recent</p>
          <ConversationsList
            conversationId={conversationId}
            onSelectConversation={(id) => { setConversationId(id); setSidebarOpen(false); }}
          />
        </div>

        <div className="p-3 border-t border-[#3d3d3f]">
          <Logout clickingLogout={handleLogout} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col md:ml-60">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#18181b] border-b border-[#3d3d3f]">
          <button onClick={() => setSidebarOpen(true)} className="text-[#adadb8] hover:text-white transition">
            <FontAwesomeIcon icon={faBars} className="text-lg" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">CodeBox</span>
          </div>
        </div>

        <ChatWindow
          conversationId={conversationId}
          onNewMessage={() => {}}
          onConversationCreated={handleConversationCreated}
        />
      </main>
    </div>
  );
};

export default MainBody;