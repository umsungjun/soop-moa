"use client";

import { Keyboard, Radio } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DirectIdTab } from "./direct-id-tab";

interface AddStreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (bjId: string) => void;
  /** Live browser slot injected by the app layer to keep domains decoupled. */
  renderLiveList: (onPick: (bjId: string) => void) => React.ReactNode;
}

export function AddStreamDialog({
  open,
  onOpenChange,
  onPick,
  renderLiveList,
}: AddStreamDialogProps) {
  const handlePick = (bjId: string) => {
    onPick(bjId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>방송 추가</DialogTitle>
          <DialogDescription>
            라이브 목록에서 선택하거나 BJ 아이디를 직접 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="live" className="min-h-0 flex-1">
          <TabsList>
            <TabsTrigger value="live" className="gap-1.5">
              <Radio className="size-3.5" />
              라이브 목록
            </TabsTrigger>
            <TabsTrigger value="direct" className="gap-1.5">
              <Keyboard className="size-3.5" />
              직접 입력
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="live"
            className="min-h-0 flex-1 overflow-y-auto pr-1"
          >
            {renderLiveList(handlePick)}
          </TabsContent>

          <TabsContent value="direct">
            <DirectIdTab onSubmit={handlePick} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
