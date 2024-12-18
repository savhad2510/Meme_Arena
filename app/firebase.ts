import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, where, getDocs, query, runTransaction } from "firebase/firestore";
import { collection, addDoc, updateDoc, arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore';
import { increment } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const addMemeBattle = async (battle: { name: string; description: string; memes: Array<{ name: string; image: string; hashtag: string }> }) => {
  try {
    const docRef = await addDoc(collection(db, 'battles'), {
      ...battle,
      createdAt: serverTimestamp(),
      // endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      endTime: new Date(Date.now() + 4 * 60* 1000 ),
      status: 'active',
      winningMeme: null // Add this line
    });
    console.log("Battle added with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding battle: ", e);
    return null;
  }
};

export const addMemeToBattle = async (battleId: string, meme: { name: string; image: string; hashtag: string }, userId: string, betAmount: number) => {
  const battleRef = doc(db, 'battles', battleId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const battleDoc = await transaction.get(battleRef);
      if (!battleDoc.exists()) {
        throw "Battle does not exist!";
      }

      const battleData = battleDoc.data();
      const memes = battleData.memes || [];
      const existingMemeIndex = memes.findIndex((m: any) => m.name === meme.name);

      if (existingMemeIndex > -1) {
        // Meme already exists, add user to participants
        memes[existingMemeIndex].participants.push({ userId, betAmount });
      } else {
        // New meme, add it to the array
        memes.push({
          ...meme,
          participants: [{ userId, betAmount }]
        });
      }

      transaction.update(battleRef, { memes });
    });

    console.log("Meme added to battle successfully");
    return true;
  } catch (e) {
    console.error("Error adding meme to battle: ", e);
    return false;
  }
};

export const placeBet = async (
  battleId: string,
  memeIndex: number,
  userAddress: string,
  amount: number
) => {
  try {
    const betRef = doc(db, "battles", battleId, "bets", userAddress);
    await setDoc(betRef, {
      memeIndex,
      amount,
      timestamp: new Date()
    });
    console.log("Bet placed successfully");
    return true;
  } catch (e) {
    console.error("Error placing bet: ", e);
    return false;
  }
};

export const getBattleDetails = async (battleId: string) => {
  try {
    const battleDoc = await getDoc(doc(db, "battles", battleId));
    if (battleDoc.exists()) {
      return { id: battleDoc.id, ...battleDoc.data() };
    } else {
      console.log("No such battle!");
      return null;
    }
  } catch (e) {
    console.error("Error getting battle details: ", e);
    return null;
  }
};

export const getMemeDetails = async (battleId: string, memeIndex: number) => {
  try {
    const battleDoc = await getDoc(doc(db, "battles", battleId));
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      if (battleData.memes && battleData.memes[memeIndex]) {
        return battleData.memes[memeIndex];
      } else {
        console.log("No such meme in this battle!");
        return null;
      }
    } else {
      console.log("No such battle!");
      return null;
    }
  } catch (e) {
    console.error("Error getting meme details: ", e);
    return null;
  }
};



export const registerUser = async (userAddress: string) => {
  const userRef = doc(db, 'users', userAddress);
  await setDoc(userRef, {
    battlesParticipated: 0,
    battlesWon: 0,
    totalStaked: 0,
    wonMemes: []
  }, { merge: true });
};

export const updateUserBet = async (userAddress: string, battleId: string, memeIndex: number, betAmount: number) => {
  const userRef = doc(db, 'users', userAddress);
  const battleRef = doc(db, 'battles', battleId);

  await updateDoc(userRef, {
    battlesParticipated: increment(1),
    totalStaked: increment(betAmount)
  });

  await updateDoc(battleRef, {
    [`memes.${memeIndex}.participants`]: arrayUnion({ userAddress, betAmount })
  });
};

export const updateBattleWinner = async (battleId: string, winningMemeIndex: number) => {
  const battleRef = doc(db, 'battles', battleId);
  const battleDoc = await getDoc(battleRef);
  const battleData = battleDoc.data();

  if (battleData) {
    const winningMeme = battleData.memes[winningMemeIndex];
    for (const participant of winningMeme.participants) {
      const userRef = doc(db, 'users', participant.userAddress);
      await updateDoc(userRef, {
        battlesWon: increment(1),
        wonMemes: arrayUnion(winningMeme.hashtag)
      });
    }
  }
};




// Add this function to get battle status
export const getBattleStatus = async (battleId: string) => {
  try {
    const battleDoc = await getDoc(doc(db, "battles", battleId));
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      return battleData.status || 'closed'; // Default to 'closed' if status is not set
    } else {
      console.log("No such battle!");
      return 'closed';
    }
  } catch (e) {
    console.error("Error getting battle status: ", e);
    return 'closed';
  }
};

// Add a function to update battle status
export const updateBattleStatus = async (battleId: string, status: 'open' | 'closed') => {
  try {
    const battleRef = doc(db, "battles", battleId);
    await updateDoc(battleRef, { status });
    console.log(`Battle status updated to ${status}`);
    return true;
  } catch (e) {
    console.error("Error updating battle status: ", e);
    return false;
  }
}
// Add these functions to your firebase.ts file

export const addUserBet = async (userId: string, battleId: string, memeId: string, amount: number, memeInfo: { name: string, image: string, hashtag: string }) => {
  const userRef = doc(db, 'users', userId);
  const battleRef = doc(db, 'battles', battleId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const battleDoc = await transaction.get(battleRef);

    if (!userDoc.exists()) {
      transaction.set(userRef, {
        battlesParticipated: [battleId],
        memesBetOn: [{battleId, memeId, memeInfo}],
        totalStaked: amount
      });
    } else {
      const userData = userDoc.data();
      transaction.update(userRef, {
        battlesParticipated: arrayUnion(battleId),
        memesBetOn: arrayUnion({battleId, memeId, memeInfo}),
        totalStaked: (userData.totalStaked || 0) + amount
      });
    }

    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      const memeIndex = battleData.memes.findIndex((meme: any) => meme.id === memeId);
      if (memeIndex !== -1) {
        transaction.update(battleRef, {
          [`memes.${memeIndex}.participants`]: arrayUnion(userId)
        });
      }
    }
  });
};

export const updateWinningMeme = async (battleId: string, memeId: string) => {
  const battleRef = doc(db, 'battles', battleId);
  await updateDoc(battleRef, {
    winningMeme: memeId
  });

  const battleDoc = await getDoc(battleRef);
  const battleData = battleDoc.data();
  const winningMeme = battleData?.memes[memeId];

  if (winningMeme && winningMeme.bets) {
    for (const userId in winningMeme.bets) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        wins: increment(1)
      });
    }
  }
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.data();
};

export const getUserBattles = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return [];
  }

  const userData = userDoc.data();
  const memesBetOn = userData.memesBetOn || [];

  const battles = await Promise.all(memesBetOn.map(async (bet: { battleId: string, memeId: string, memeInfo: any }) => {
    const battleRef = doc(db, 'battles', bet.battleId);
    const battleDoc = await getDoc(battleRef);
    if (battleDoc.exists()) {
      const battleData = battleDoc.data();
      return { 
        id: battleDoc.id, 
        ...battleData, 
        userBetMemeId: bet.memeId,
        memeInfo: bet.memeInfo
      };
    }
    return null;
  }));

  return battles.filter(battle => battle !== null);
};

export const updateUserBets = async (userId: string, battleId: string, memeId: string) => {
  const userRef = doc(db, 'users', userId);
  
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        transaction.set(userRef, { bets: [{ battleId, memeId }] });
      } else {
        const userData = userDoc.data();
        const bets = userData.bets || [];
        bets.push({ battleId, memeId });
        transaction.update(userRef, { bets });
      }
    });

    console.log("User bets updated successfully");
    return true;
  } catch (e) {
    console.error("Error updating user bets: ", e);
    return false;
  }
};

export const getUserMemes = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return [];
    }

    const userData = userDoc.data();
    const bets = userData.bets || [];

    const memes = await Promise.all(bets.map(async (bet: { battleId: string; memeId: string }) => {
      const battleRef = doc(db, 'battles', bet.battleId);
      const battleDoc = await getDoc(battleRef);
      if (battleDoc.exists()) {
        const battleData = battleDoc.data();
        const meme = battleData.memes.find((m: any) => m.name === bet.memeId);
        return meme ? { ...meme, battleId: bet.battleId } : null;
      }
      return null;
    }));

    return memes.filter(meme => meme !== null);
  } catch (e) {
    console.error("Error fetching user memes: ", e);
    return [];
  }
};

export const getWinningMeme = async (battleId: string) => {
  const battleRef = doc(db, 'battles', battleId);
  const battleDoc = await getDoc(battleRef);
  if (battleDoc.exists()) {
    return battleDoc.data().winningMeme;
  }
  return null;
};