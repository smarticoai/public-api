/** Possible statuses of the mission availability. 
 *  Notes:
 *   - Recurring missions have a special field next_recurrence_date_ts, but it's only relevant if the mission has no active till date or the next recurrence date is before the active till date.
 *   - For a locked mission or mission that requires opt-in, the time limit should be calculated as dt_start + time_limit_ms. For a mission that does not require opt-in or type is not Locked, it should be the highest value of dt_start and active_from_ts (if defined) + time_limit_ms.
 * */

export enum AchievementAvailabilityStatus {
    /** Mission without date/time restrictions or with passed active from date and no opt-in required and mission is unlocked */
    Available = 0,

    /** Mission without date/time restrictions or with passed active from date, opt-in is required, user is not opted-in or mission is locked */
    AvailableInactive = 1,

    /** Mission without date/time restrictions or with passed active from date, opt-in is required, user is opted-in or mission is unlocked*/
    AvailableActive = 2,

    /** Mission with active from date defined, date is in future.
     * Field: active_from_ts
    */
    UnavailableWithActiveFrom = 3,

    /** Mission with active till date defined, date is in future, and no opt-in required and mission is unlocked.
     * Field: active_till_ts
    */
    AvailableWithActiveTill = 4,

    /** Mission with active till date defined, date is in future, and opt-in is required, user is not opted in or mission is locked.
     * Fields: active_till_ts, is_requires_optin, is_opted_in, is_locked.
    */
    AvailableWithActiveTillInactive = 5,

    /** Mission with active till date defined, date is in future, and opt-in is required, user is opted in or mission is unlocked.
     * Fields: active_till_ts, is_requires_optin, is_opted_in, is_locked.
    */
    AvailableWithActiveTillActive = 6,

    /** Available mission with time limit, and opt-in is required or mission is unlocked.
     * The time limit is calculated as the sum of two properties: (highest value from dt_start and active_from_ts) + time_limit_ms.
     * 
    */
    AvailableLimited = 7,

    /** Available mission with time limit, opt-in is required, user is not opted-in or mission is locked.
     * Time limit at this stage is not relevant, user should be opted-in or mission should be unlocked.
    */
    AvailableLimitedInactive = 8,

   /** Available mission with time limit, opt-in is required, user is opted-in or mission unlocked.
     * The time limit is calculated as the sum of two properties: dt_start + time_limit_ms.
    */
    AvailableLimitedActive = 9,

    /** Available mission with time limit and active till date, opt-in is not required and mission is unlocked.
     * Fields: active_till_ts, time_limit_ms, dt_start, active_from_ts;
     * The time limit is calculated as the sum of two properties: (highest value from dt_start and active_from_ts) + time_limit_ms.
    */
    AvailableFullyLimited = 10,

   /** Available mission with time limit and active till date, opt-in is required, user is not opted in or mission is locked.
     * Fields: active_till_ts, time_limit_ms, dt_start, active_from_ts, is_requires_optin, is_opted_in, is_locked.
     * On this stage only active_till_ts is relevant. time_limit_ms is ignored because user should be opted in.
    */
    AvailableFullyLimitedInactive = 11,

    /** Available mission with time limit and active till date, opt-in is required, user is opted in or mission is unlocked.
     * Fields: active_till_ts, time_limit_ms, dt_start, is_requires_optin, is_opted_in, is_locked.
     * The time limit is calculated as the sum of two properties: dt_start + time_limit_ms.
    */
    AvailableFullyLimitedActive = 12,

    /** Missed mission when active till date is already passed. is_completed field indicating if mission is completed or just missed  */
    MissedByActiveTill = 13,

     /** Missed mission when start_date + time_limit_ms is already passed. is_completed field indicating if mission is completed or just missed  */
    MissedByLimitInTime = 14,
}