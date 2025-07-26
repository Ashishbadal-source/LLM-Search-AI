# SmileStatistics Component Integration Guide

This guide shows you how to integrate the new `SmileStatistics` component into your existing `InterviewPage.jsx` file.

## Files Created

1. `frontend/src/Components/SmileStatistics/SmileStatistics.jsx` - The extracted smile statistics component
2. `frontend/src/hooks/useSmileTracking.js` - Custom hook for managing smile tracking state
3. `frontend/src/Pages/InterviewPage/InterviewPageRefactored.jsx` - Example of how to integrate

## Step-by-Step Integration

### 1. Add Imports to Your InterviewPage.jsx

Add these imports at the top of your file:

```javascript
import SmileStatistics from '../../Components/SmileStatistics/SmileStatistics';
import { useSmileTracking } from '../../hooks/useSmileTracking';
```

### 2. Replace Smile State Management

**Remove these lines from your component:**
```javascript
const [smileStats, setSmileStats] = useState({ smiles: 0, unsmiles: 0, total: 0 });
const totalFramesRef = useRef(0);
const smileFramesRef = useRef(0);
const unsmileRef = useRef(0);

// Remove this useEffect
useEffect(() => {
  setSmileStats({
    smiles: smileFramesRef.current,
    unsmiles: unsmileRef.current,
    total: totalFramesRef.current,
  });
}, [/* trigger after each frame or result, or poll periodically */]);
```

**Replace with:**
```javascript
// Use the custom smile tracking hook
const {
  smileStats,
  smileFramesRef,
  unsmileRef,
  totalFramesRef,
  updateSmileStats,
  resetSmileStats,
  getCurrentStats
} = useSmileTracking();
```

### 3. Replace the Smile Stats Panel

**Remove this entire block from your render:**
```javascript
{/* Paste the smile stats panel here */}
<div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
  <div className="bg-white/90 text-gray-700 p-2 rounded shadow text-xs">
    <div>😊 Smiles: {smileStats.smiles}</div>
    <div>😐 Unsmiles: {smileStats.unsmiles}</div>
    <div>Frames: {smileStats.total}</div>
    <div>Smile rate: {smileStats.total ? ((smileStats.smiles/smileStats.total)*100).toFixed(1) : 0}%</div>
  </div>
</div>
{/* End smile stats panel */}
```

**Replace with:**
```javascript
{/* Smile Statistics Component - now using the extracted component */}
<SmileStatistics 
  smileStats={smileStats}
  isVisible={true}
  position="top-right"
/>
```

### 4. Update sendFaceStatsToServer Function

**Replace your existing function with:**
```javascript
const sendFaceStatsToServer = async () => {
  try {
    if (!hasStarted.current) return;

    const stats = getCurrentStats();
    const res = await fetch(`${API_BASE_URL}/save_face_stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        smileFrames: stats.smileFrames,
        unsmileFrames: stats.unsmileFrames,
        smileTotal: stats.totalFrames,
        lookFrames: lookFrames,
        lookTotal: lookTotalFrames,
        blinkCount: blinkCounter
      })
    });
    const result = await res.json();
    if (result.success) {
      console.log("📊 Face stats saved successfully");
    } else {
      console.error("❌ Failed to save face stats:", result.message);
    }
  } catch (err) {
    console.error("❌ Failed to send face stats:", err);
  }
};
```

### 5. Update useEffect Dependencies

**In your main useEffect, update the dependency array:**
```javascript
useEffect(() => {
  if (!hasStartedRecording.current) {
    hasStartedRecording.current = true;

    // Reset smile stats when interview starts
    resetSmileStats();

    // ... your existing code
  }

  // ... rest of your useEffect code
}, [resetSmileStats, smileFramesRef, unsmileRef, totalFramesRef]);
```

## Component Props

The `SmileStatistics` component accepts these props:

- `smileStats` (required): Object with `{ smiles, unsmiles, total }`
- `isVisible` (optional): Boolean to show/hide the component (default: true)
- `position` (optional): String for positioning - 'top-right', 'top-left', 'bottom-right', 'bottom-left' (default: 'top-right')

## Benefits of This Refactoring

1. **Separation of Concerns**: Smile tracking logic is separated from the main interview logic
2. **Reusability**: The component can be used in other parts of your app
3. **Maintainability**: Easier to modify smile statistics display without touching interview logic
4. **Testing**: Components can be tested independently
5. **Performance**: Better state management with custom hooks

## Advanced Usage

You can customize the component position and visibility:

```javascript
<SmileStatistics 
  smileStats={smileStats}
  isVisible={hasStarted.current} // Only show when interview starts
  position="bottom-left"
/>
```

Or conditionally render it:

```javascript
{hasStarted.current && (
  <SmileStatistics 
    smileStats={smileStats}
    position="top-left"
  />
)}
```