import { useState, useEffect } from "react";
import { CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import { attendanceApi } from "../../api/attendance";

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const { showToast } = useToast();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchToday = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.today();
      setTodayRecord(res.data.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to load attendance status.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleMark = async () => {
    setMarking(true);
    try {
      const res = await attendanceApi.mark();
      setTodayRecord(res.data.data);
      showToast("Attendance marked successfully!");
    } catch (err) {
      if (err.response?.status === 409) {
        showToast(err.response.data.message, "error");
        fetchToday(); // sync state - already marked elsewhere
      } else {
        showToast(
          err.response?.data?.message || "Unable to mark attendance.",
          "error"
        );
      }
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">
        Attendance
      </h1>
      <p className="mt-1 text-sm text-ink-600">{today}</p>

      <Card className="mt-6 flex flex-col items-center text-center py-10">
        {todayRecord ? (
          <>
            <div className="h-16 w-16 rounded-full bg-brand-50 flex items-center justify-center">
              <CheckCircle2 className="text-brand-600" size={30} />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">
              You're marked present today
            </h2>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-600">
              <Clock size={14} />
              Marked at{" "}
              {new Date(`1970-01-01T${todayRecord.time}`).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}
            </div>
            <Button variant="secondary" disabled className="mt-6">
              Attendance already marked
            </Button>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-ink-100 flex items-center justify-center">
              <CalendarCheck className="text-ink-400" size={30} />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">
              You haven't marked attendance yet
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              Tap the button below to mark yourself present for today.
            </p>
            <Button loading={marking} onClick={handleMark} className="mt-6">
              Mark attendance
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}