
"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Corrected import path
import { onAuthChange } from '@/lib/auth'; // Corrected import path
import { saveUserDocument, getUserDocuments, updateUserDocument } from '@/lib/firestore'; // Corrected import path
import { UserDocument } from '@/types/user-data'; // Corrected import path
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { AuthControl } from '@/components/auth/AuthControl'; 
import { Toaster } from '@/components/ui/toaster';
import { Dock } from '@/components/cognicanvas/dock';
import { Space } from '@/components/cognicanvas/space';
import type { ActiveToolInstance, Tool } from '@/components/cognicanvas/types';
import { ALL_TOOLS } from '@/components/cognicanvas/constants'; // Removed .tsx
import { ThemeSwitcher } from '@/components/cognicanvas/theme-switcher';
import { Button } from '@/components/ui/button';
import { HelpCircle, Bot } from 'lucide-react';
import { TutorialModal } from '@/components/cognicanvas/tutorial-modal';
import { AddMcpServerModal } from '@/components/cognicanvas/add-mcp-server-modal'; // Added import

// A small component to handle the sidebar trigger within the provider context
const CustomSidebarTrigger = () => {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="h-8 w-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
    >
      <SidebarTrigger />
    </Button>
  );
};


export default function AgentComputerLayout() {
  const [activeToolInstance, setActiveToolInstance] = useState<ActiveToolInstance | null>(null);
  const [documentContent, setDocumentContent] = useState<string>(''); 
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [isAddMcpServerModalOpen, setIsAddMcpServerModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentDocument, setCurrentDocument] = useState<UserDocument | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [documentSaveTimeout, setDocumentSaveTimeout] = useState<NodeJS.Timeout | null>(null);


  const openTool = useCallback((tool: Tool) => {
    const newInstance: ActiveToolInstance = {
      ...tool,
      instanceId: `${tool.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      windowState: 'default',
      content: tool.id === 'document-processor' ? documentContent : undefined,
    };
    setActiveToolInstance(newInstance);
  }, [documentContent]);

  const handleContentChange = useCallback((newContent: string) => {
    setDocumentContent(newContent);
    if (activeToolInstance?.id === 'document-processor') {
      setActiveToolInstance(prev =>
        prev && prev.id === 'document-processor' ? { ...prev, content: newContent } : prev
      );
    }

    if (currentUser && currentDocument) {
      // Clear existing timeout to debounce saves
      if (documentSaveTimeout) {
        clearTimeout(documentSaveTimeout);
      }
      // Set a new timeout
      const timeoutId = setTimeout(async () => {
        console.log("Attempting to save document:", currentDocument.id);
        await updateUserDocument(currentDocument.id, newContent, currentDocument.name); // Pass name to avoid it being reset
        console.log("Document updated with new content.");
      }, 1000); // Debounce time: 1 second
      setDocumentSaveTimeout(timeoutId);
    }
  }, [activeToolInstance, currentUser, currentDocument, documentSaveTimeout]);

  const handleTutorial = () => {
    setIsTutorialModalOpen(true);
  };

  const handleOpenAddMcpServerModal = () => {
    setIsAddMcpServerModalOpen(true);
  };

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [hasMounted, setHasMounted] = React.useState(false);

  useEffect(() => {
    setHasMounted(true);
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = () => {
      setIsSidebarOpen(!mediaQuery.matches);
    };
    handleResize();
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  // Effect for handling authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        console.log("User logged in:", user.uid);
        setIsLoadingDocuments(true);
        try {
          const docs = await getUserDocuments(user.uid);
          if (docs.length > 0) {
            // Sort by updatedAt descending, and pick the first one
            const sortedDocs = docs.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
            const mostRecentDoc = sortedDocs[0];
            setCurrentDocument(mostRecentDoc);
            setDocumentContent(mostRecentDoc.content);
            console.log("Loaded most recent document:", mostRecentDoc.id);
          } else {
            console.log("No documents found, creating a new one.");
            const newDocId = await saveUserDocument(user.uid, "", "My First Document");
            if (newDocId) {
              // Ideally, fetch the new doc to get its full structure including timestamps
              // For now, construct a temporary UserDocument or fetch it if saveUserDocument returns it
              const newDoc: UserDocument = { 
                id: newDocId, 
                userId: user.uid, 
                content: "", 
                name: "My First Document", 
                // Timestamps would ideally come from Firestore or be set locally if not returned
                createdAt: { seconds: Date.now()/1000, nanoseconds: 0 } as any, // Temporary
                updatedAt: { seconds: Date.now()/1000, nanoseconds: 0 } as any  // Temporary
              };
              setCurrentDocument(newDoc);
              setDocumentContent(""); 
              console.log("Created and loaded new document:", newDocId);
            } else {
               console.error("Failed to create a new document.");
               setDocumentContent(""); // Fallback
            }
          }
        } catch (error) {
          console.error("Error during document loading/creation:", error);
          setDocumentContent(""); // Fallback content on error
        } finally {
          setIsLoadingDocuments(false);
        }
      } else {
        console.log("User logged out.");
        setCurrentDocument(null);
        setDocumentContent(''); // Clear content on logout
        if (documentSaveTimeout) {
          clearTimeout(documentSaveTimeout);
          setDocumentSaveTimeout(null);
        }
      }
    });
    return () => {
      unsubscribe();
      if (documentSaveTimeout) {
        clearTimeout(documentSaveTimeout);
      }
    };
  }, [documentSaveTimeout]); // Added documentSaveTimeout to dependency array

  const navigateToOrchestrationCenter = () => {
    setActiveToolInstance(null);
  };


  return (
    <SidebarProvider
      open={hasMounted ? isSidebarOpen : true}
      onOpenChange={setIsSidebarOpen}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible="icon"
          className="border-r bg-sidebar text-sidebar-foreground shadow-md data-[collapsible=icon]:shadow-sm transition-all duration-300 ease-in-out z-20"
        >
          <SidebarHeader className="p-2 flex justify-between items-center h-14 border-b border-sidebar-border">
             <button onClick={navigateToOrchestrationCenter} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center w-full cursor-pointer hover:opacity-80 transition-opacity">
                <Bot className="h-7 w-7 text-primary shrink-0" />
                <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden truncate">Agent-Computer</h1>
             </button>
          </SidebarHeader>
          <SidebarContent className="p-0">
            <div className="p-2 border-b border-sidebar-border">
              <AuthControl />
            </div>
            {isLoadingDocuments && currentUser && (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading documents...</div>
            )}
            {!isLoadingDocuments && currentUser && !currentDocument && (
              <div className="p-4 text-center text-sm text-muted-foreground">No active document.</div>
            )}
            {/* Dock should ideally only show tools if a document is loaded or user is logged in,
                but for now, it's always visible after AuthControl. */}
            <Dock 
              tools={ALL_TOOLS} 
              onSelectTool={openTool} 
              activeToolId={activeToolInstance?.id}
              onAddMcpServerClick={handleOpenAddMcpServerModal}
            />
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border h-14">
              <div className="flex items-center justify-center group-data-[collapsible=icon]:flex-col gap-1.5">
                  <ThemeSwitcher />
                  <Button variant="ghost" size="icon" onClick={handleTutorial} className="w-8 h-8" title="Tutorial">
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Tutorial</span>
                  </Button>
              </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden relative">
          <div className="absolute top-2 left-2 z-10 md:hidden">
             <CustomSidebarTrigger />
          </div>
          <Space
            activeToolInstance={activeToolInstance}
            onContentChange={handleContentChange}
            tools={ALL_TOOLS}
            onSelectTool={openTool}
            // Optionally pass isLoading to Space if it needs to show a loading state internally
            // isLoading={isLoadingDocuments && !!currentUser} 
          />
        </SidebarInset>
      </div>
      <Toaster />
      <TutorialModal isOpen={isTutorialModalOpen} onOpenChange={setIsTutorialModalOpen} />
      <AddMcpServerModal isOpen={isAddMcpServerModalOpen} onOpenChange={setIsAddMcpServerModalOpen} />
    </SidebarProvider>
  );
}
