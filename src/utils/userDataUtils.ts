import { db } from './firebase';
import { doc, updateDoc, getDoc, collection, query, getDocs, writeBatch, where } from 'firebase/firestore';
import { StreakData, saveStreakData } from './streakUtils';

/**
 * Updates a specific user's data directly in Firebase
 */
export const updateUserDataDirectly = async (userId: string, newData: Partial<StreakData>) => {
  try {
    const userDocRef = doc(db, "users", userId);
    
    // First get the current data
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      return { success: false, error: "User not found" };
    }
    
    const userData = docSnap.data();
    const currentStreakData = userData.streakData as StreakData;
    
    // Create updated data by merging current and new data
    const updatedData = {
      ...currentStreakData,
      ...newData
    };
    
    // Update both Firebase and localStorage
    await saveStreakData(updatedData, userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user data directly:', error);
    return { success: false, error };
  }
};

/**
 * Batch updates multiple users based on criteria
 */
export const batchUpdateUsers = async (
  updateCriteria: (data: any) => boolean, 
  updateFunction: (data: StreakData) => Partial<StreakData>
) => {
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(query(usersRef));
    
    let count = 0;
    
    // Process each user one by one (no batch) so we can use saveStreakData
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Only update if criteria is met
      if (updateCriteria(userData)) {
        try {
          const updatedFields = updateFunction(userData.streakData);
          
          // Create complete updated data
          const updatedData = {
            ...userData.streakData,
            ...updatedFields
          };
          
          // Update both Firebase and localStorage
          await saveStreakData(updatedData, userDoc.id);
          count++;
        } catch (e) {
          console.error(`Error updating user ${userDoc.id}:`, e);
        }
      }
    }
    
    return { updatedCount: count };
  } catch (error) {
    console.error('Error in batch update:', error);
    return { success: false, error };
  }
};

/**
 * Fix common data issues for a specific user
 */
export const fixUserDataIssues = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: "User not found" };
    }
    
    const userData = docSnap.data();
    const streakData = userData.streakData as StreakData;
    
    // Fix negative values
    const fixedData = {
      ...streakData,
      currentStreak: Math.max(0, streakData.currentStreak || 0),
      longestStreak: Math.max(0, streakData.longestStreak || 0),
      totalDaysStudied: Math.max(0, streakData.totalDaysStudied || 0),
      totalReward: Math.max(0, streakData.totalReward || 0)
    };
    
    // Fix duplicate study days
    if (Array.isArray(fixedData.studyDays)) {
      fixedData.studyDays = [...new Set(fixedData.studyDays)];
    } else {
      fixedData.studyDays = [];
    }
    
    // Fix ongoing session if it's been active for more than 24 hours
    if (fixedData.ongoingSession) {
      const startTime = new Date(fixedData.ongoingSession.startTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        fixedData.ongoingSession = null;
      }
    }
    
    // Update both Firebase and localStorage
    await saveStreakData(fixedData, userId);
    
    return { success: true, fixedData };
  } catch (error) {
    console.error('Error fixing user data issues:', error);
    return { success: false, error };
  }
};

/**
 * Fix common data issues for all users
 */
export const fixAllUsersDataIssues = async () => {
  try {
    return await batchUpdateUsers(
      () => true, // Apply to all users
      (streakData) => {
        // Fix negative values
        const fixedData: Partial<StreakData> = {
          currentStreak: Math.max(0, streakData.currentStreak || 0),
          longestStreak: Math.max(0, streakData.longestStreak || 0),
          totalDaysStudied: Math.max(0, streakData.totalDaysStudied || 0),
          totalReward: Math.max(0, streakData.totalReward || 0)
        };
        
        // Fix duplicate study days
        if (Array.isArray(streakData.studyDays)) {
          fixedData.studyDays = [...new Set(streakData.studyDays)];
        } else {
          fixedData.studyDays = [];
        }
        
        // Fix ongoing session if it's been active for more than 24 hours
        if (streakData.ongoingSession) {
          const startTime = new Date(streakData.ongoingSession.startTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff > 24) {
            fixedData.ongoingSession = null;
          }
        }
        
        return fixedData;
      }
    );
  } catch (error) {
    console.error('Error fixing all users data issues:', error);
    return { success: false, error };
  }
};

/**
 * Export user data to JSON
 */
export const exportUserData = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: "User not found" };
    }
    
    const userData = docSnap.data();
    
    // Create a download link
    const dataStr = JSON.stringify(userData.streakData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    // Create and trigger download
    const exportFileDefaultName = `user_data_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    
    return { 
      success: true, 
      data: userData.streakData,
      downloadUri: dataUri,
      filename: exportFileDefaultName
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return { success: false, error };
  }
};

/**
 * Import user data from JSON
 */
export const importUserData = async (userId: string, jsonData: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: "User not found" };
    }
    
    // Parse the JSON data
    const parsedData = JSON.parse(jsonData) as StreakData;
    
    // Validate the data structure
    const requiredFields = [
      'currentStreak', 
      'longestStreak', 
      'totalDaysStudied', 
      'totalReward',
      'studyDays',
      'studySessions'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in parsedData));
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: `Invalid data format. Missing fields: ${missingFields.join(', ')}` 
      };
    }
    
    // Update both Firebase and localStorage using saveStreakData
    await saveStreakData(parsedData, userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error importing user data:', error);
    return { success: false, error };
  }
}; 