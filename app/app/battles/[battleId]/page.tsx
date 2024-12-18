import { Suspense } from 'react';
import BattleDetails from '../../../components/BattleDetails';

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-[white] text-white">
    <div className="text-center text-white">
      <svg
        className="w-12 h-12 mx-auto mb-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M4 12a8 8 0 0 1 16 0" />
      </svg>
      <p className="text-xl font-semibold text-white">Loading...</p>
    </div>
  </div>
);

export default function BattleDetailsPage({ params }: { params: { battleId: string } }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <BattleDetails battleId={params.battleId} />
    </Suspense>
  );
}
