# ⏳ Offline Queue System - Documentation

**Date:** 2025-10-22  
**Feature:** Automatic reservation queue with network detection  
**Status:** ✅ IMPLEMENTED

---

## 🎯 What It Does

When you make a reservation while offline (or when the server is down):

1. **Queues the reservation** - Saves it in AsyncStorage
2. **Shows "Waiting for Connection"** message
3. **Listens for network changes** - Detects when internet comes back
4. **Automatically sends** - Processes all queued reservations when online
5. **Notifies you** - Shows success message with count

---

## 🚀 How It Works

### User Experience

#### Scenario 1: Making Reservation While Offline

1. User turns on **Airplane Mode**
2. Opens app → Events tab
3. Clicks on an event → Reserve
4. **Sees message:**
   ```
   ⏳ Waiting for Connection
   
   Reservation for "AI Conference" is queued.
   
   It will be sent automatically when internet 
   connection is restored.
   ```
5. **Header shows:** "⏳ 1 reservation waiting..."

#### Scenario 2: Connection Restored

1. User turns off **Airplane Mode**
2. **App automatically detects** connection
3. **Sends all queued reservations** to server
4. **Shows alert:**
   ```
   ✅ Reservations Sent
   
   2 reservation(s) sent successfully!
   ```
5. **Header updates** - Pending count disappears

---

## 📁 Files Created/Modified

### New File: `utils/offlineQueue.ts`

Queue management system with these functions:

```typescript
// Add reservation to queue
addToQueue(eventId, userId, eventTitle)

// Get all queued reservations
getQueue()

// Process queue (send to server)
processQueue()

// Start network listener
startNetworkListener(callback)

// Get pending count
getPendingCount()
```

### Modified: `app/(tabs)/event.tsx`

Added:
- Network listener that auto-processes queue
- Pending count display in header
- Queue-based offline handling
- Automatic retry on connection restore

---

## 🔍 Technical Details

### Queue Storage

**Location:** AsyncStorage with key `offline_reservations_queue`

**Data Structure:**
```typescript
interface QueuedReservation {
  id: string;              // Unique ID
  eventId: string;         // Event to reserve
  userId: string;          // User making reservation
  eventTitle: string;      // Event name (for display)
  timestamp: number;       // When queued
  retryCount: number;      // Failed attempts
}
```

### Network Detection

Uses `@react-native-community/netinfo`:

```typescript
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    // Connection restored - process queue
    processQueue();
  }
});
```

### Retry Logic

- **Max retries:** 3 attempts
- **On failure:** Increments retry count
- **After 3 failures:** Removes from queue
- **Prevents:** Infinite retry loops

---

## 🧪 Testing

### Test 1: Queue Reservation While Offline

**Steps:**
1. Turn on Airplane Mode
2. Open app → Events
3. Reserve an event
4. Check header shows "⏳ 1 reservation waiting..."

**Expected:**
- No error
- Reservation queued
- Message shows "Waiting for Connection"

### Test 2: Auto-Send When Online

**Steps:**
1. Make 2-3 reservations while offline
2. Turn off Airplane Mode
3. Wait 2-3 seconds

**Expected:**
- Alert: "✅ Reservations Sent - X reservation(s) sent successfully!"
- Header pending count becomes 0
- Events list refreshes

### Test 3: Server Error Handling

**Steps:**
1. Turn off backend server
2. Make reservation while online
3. Should queue with message "Server error. Reservation queued..."

**Expected:**
- Queued for retry
- Will send when server is back

---

## 🆚 Comparison: Old vs New

### Old System (SQLite)

❌ **Problems:**
- Manual sync required
- User had to go to Sync tab
- Schema migration issues
- No automatic detection

### New System (Queue)

✅ **Benefits:**
- **Automatic** - No user action needed
- **Real-time** - Detects connection instantly
- **Simple** - Uses AsyncStorage (no schema)
- **Reliable** - Retry logic with max attempts
- **Visual** - Shows pending count in header

---

## 📊 Flow Diagram

```
User Makes Reservation
         |
         v
   Is Online? ----Yes----> Send to Server -----> ✅ Success
         |                                  |
        No                                  |
         |                              Error?
         v                                  |
   Add to Queue                            Yes
         |                                  |
         v                                  v
Show "Waiting..." <-----------------  Add to Queue
         |
         v
Network Listener Active
         |
    Connection
    Restored?
         |
        Yes
         |
         v
   Process Queue -----> Send All -----> ✅ Success Alert
         |                         |
         |                      Failed?
         |                         |
         v                        Yes
   Update Count              Retry (max 3)
```

---

## 🎨 UI Elements

### Header Indicator

When reservations are pending:
```
Events
⏳ 2 reservations waiting...
```

**Style:**
- Orange color (#f39c12)
- Small font (12px)
- Below "Events" title

### Alert Messages

**Offline:**
```
⏳ Waiting for Connection

Reservation for "Event Name" is queued.

It will be sent automatically when internet 
connection is restored.
```

**Connection Restored:**
```
✅ Reservations Sent

3 reservation(s) sent successfully!
```

---

## 🔧 Configuration

### Retry Settings

In `utils/offlineQueue.ts`:

```typescript
// Max retry attempts before removing
if (reservation.retryCount >= 3) {
  await removeFromQueue(reservation.id);
}
```

To change max retries, modify the number `3`.

### Queue Key

```typescript
const QUEUE_KEY = 'offline_reservations_queue';
```

To use a different storage key, change this constant.

---

## 🐛 Troubleshooting

### Queue Not Processing

**Check:**
1. Network listener is active
2. Console shows "🌐 Connection restored"
3. Queue has items: `await getQueue()`

**Solution:**
- Restart app
- Check network permissions

### Reservations Not Sending

**Check:**
1. Backend is running
2. API_BASE_URL is correct
3. Token is valid

**Debug:**
```typescript
const queue = await getQueue();
console.log('Queue:', queue);
```

### Pending Count Not Updating

**Check:**
- `updatePendingCount()` is called after queue changes
- Component is focused

**Solution:**
- Reload the Events tab

---

## 🎯 Summary

✅ **Automatic queue** - No manual sync needed  
✅ **Network detection** - Instant connection awareness  
✅ **Visual feedback** - Pending count in header  
✅ **Retry logic** - Handles temporary failures  
✅ **User-friendly** - Clear messages and alerts  
✅ **Reliable** - AsyncStorage persistence

---

## 🚀 Future Enhancements

Possible improvements:

1. **Background sync** - Process queue even when app is closed
2. **Conflict resolution** - Handle duplicate reservations
3. **Batch optimization** - Send multiple in one request
4. **Offline indicator** - Show connection status icon
5. **Queue management UI** - View/cancel pending reservations

---

**Last Updated:** 2025-10-22  
**Version:** 1.0  
**Status:** ✅ Production Ready
