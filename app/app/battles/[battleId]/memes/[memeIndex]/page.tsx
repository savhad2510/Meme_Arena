import { Suspense } from 'react';
import MemeChatroom from '../../../../../components/MemeChatroom';

export default function MemeChatroomPage({ params }: { params: { battleId: string, memeIndex: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MemeChatroom battleId={params.battleId} memeIndex={parseInt(params.memeIndex)} />
    </Suspense>
  );
}