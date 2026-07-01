import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Building2,
  CalendarDays,
  Sparkles,
  Plus,
  ArrowRight
} from "lucide-react";

import studentService from "../services/studentService";
import classroomService from "../services/classroomService";
import examService from "../services/examService";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/common/StatCard";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClassrooms: 0,
    totalExams: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const students = await studentService.getStudents();
        const classrooms = await classroomService.getClassrooms();
        const exams = await examService.getExams();

        setStats({
          totalStudents: students.length,
          totalClassrooms: classrooms.length,
          totalExams: exams.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const students = await studentService.getStudents();
        const classrooms = await classroomService.getClassrooms();
        const exams = await examService.getExams();
        
        setStats({
          totalStudents: students.length,
          totalClassrooms: classrooms.length,
          totalExams: exams.length,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

    return (
    <div className="space-y-10">

      <PageHeader
        badge="Overview"
        title="Dashboard"
        subtitle="Monitor examinations, classrooms, students and seating allocation from one unified workspace."
        actions={
          <Button>
            <Plus size={18} />
            New Allocation
          </Button>
        }
      />

      {/* Hero Card */}

      <Card hero className="overflow-hidden relative" >

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="max-w-2xl">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F8F4EF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A7E76]">

              <Sparkles size={14} />

              Intelligent Seating Engine

            </div>

            <h2 className="font-cormorant text-[30px] leading-none text-[#2C2825]">

              Welcome Back

            </h2>

            <p className="mt-5 text-lg leading-8 text-[#6D6660]">

              Generate intelligent seating layouts, manage examination
              infrastructure and monitor allocation progress from one
              centralized dashboard.

            </p>

          </div>

          <div className=" items-center gap-10">
              <Button size="lg"> 
                Generate Seating
                <ArrowRight size={18} />
              </Button>
          </div>

        </div>

      </Card>

      {/* Statistics */}

      <div className="grid gap-6 lg:grid-cols-3">

        <StatCard
          title="Students"
          value={loading ? "..." : stats.totalStudents}
          subtitle="Active student records"
          icon={GraduationCap}
          accent="sage"
        />

        <StatCard
          title="Classrooms"
          value={loading ? "..." : stats.totalClassrooms}
          subtitle="Configured examination rooms"
          icon={Building2}
          accent="rose"
        />

        <StatCard
          title="Examinations"
          value={loading ? "..." : stats.totalExams}
          subtitle="Upcoming examination sessions"
          icon={CalendarDays}
          accent="sky"
        />

      </div> 

            {/* ================= Main Dashboard Grid ================= */}

      <div className="grid gap-6 xl:grid-cols-3">

        {/* ================= Upcoming Exams ================= */}

        <Card
          title="Upcoming Examinations"
          subtitle="Next scheduled assessments"
          className="xl:col-span-2 min-h-[420px]"
        >

          <div className="space-y-4">

            {[
              {
                code: "CS-201",
                title: "Data Structures",
                date: "10 Jul 2026",
                time: "09:30 AM",
              },
              {
                code: "CS-302",
                title: "Operating Systems",
                date: "12 Jul 2026",
                time: "02:00 PM",
              },
              {
                code: "CS-204",
                title: "Database Systems",
                date: "15 Jul 2026",
                time: "09:30 AM",
              },
            ].map((exam) => (

              <div
                key={exam.code}
                className="flex items-center justify-between rounded-2xl border border-[#ECE4DD] bg-[#FCFBFA] p-5 transition hover:border-[#D8C8BB] hover:shadow-md"
              >

                <div>

                  <p className="text-xs uppercase tracking-[0.18em] text-[#938A84]">

                    {exam.code}

                  </p>

                  <h4 className="mt-2 font-semibold text-lg text-[#2D2825]">

                    {exam.title}

                  </h4>

                </div>

                <div className="text-right">

                  <p className="font-semibold text-[#2D2825]">

                    {exam.date}

                  </p>

                  <p className="text-sm text-[#7E7771]">

                    {exam.time}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </Card>

        {/* ================= Quick Actions ================= */}

        <Card
          title="Quick Actions"
          subtitle="Frequently used shortcuts"
        >

          <div className="grid gap-4">

            <Button className=" h-14 justify-between">

              Add Student

              <Plus size={16} />

            </Button>

            <Button
              h-14
              variant="secondary"
              className="justify-between"
            >

              Add Classroom

              <Plus size={16} />

            </Button>

            <Button
              h-14
              variant="secondary"
              className="justify-between"
            >

              Schedule Exam

              <Plus size={16} />

            </Button>

            <Button h-14 variant="outline" className="justify-between">

              Generate Seating

              <ArrowRight size={16} />

            </Button>

          </div>

        </Card>

      </div>

            {/* ================= Bottom Dashboard ================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ================= Recent Activity ================= */}

        <Card
          title="Recent Activity"
          subtitle="Latest operations performed"
        >

          <div className="space-y-5">

            {[
              {
                title: "120 Students Imported",
                time: "10 mins ago",
                color: "bg-emerald-500",
              },
              {
                title: "New Examination Created",
                time: "35 mins ago",
                color: "bg-sky-500",
              },
              {
                title: "Room LH-204 Added",
                time: "1 hour ago",
                color: "bg-amber-500",
              },
              {
                title: "Seating Layout Generated",
                time: "Yesterday",
                color: "bg-rose-500",
              },
            ].map((activity, index) => (

              <div
                key={index}
                className="flex items-start gap-4"
              >

                <div
                  className={`mt-2 h-3 w-3 rounded-full ${activity.color}`}
                />

                <div>

                  <p className="font-medium text-[#2C2825]">

                    {activity.title}

                  </p>

                  <p className="mt-1 text-sm text-[#7C746E]">

                    {activity.time}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </Card>

        {/* ================= System Status ================= */}

        <Card
          title="System Status"
          subtitle="Current platform health"
        >

          <div className="space-y-6">

            <div className="flex items-center justify-between">

              <span className="text-[#7A726B]">

                Allocation Engine

              </span>

              <span className="rounded-full bg-[#EEF4ED] px-3 py-1 text-sm font-medium text-[#64815E]">

                Operational

              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-[#7A726B]">

                Database

              </span>

              <span className="rounded-full bg-[#EEF4ED] px-3 py-1 text-sm font-medium text-[#64815E]">

                Connected

              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-[#7A726B]">

                Active Classrooms

              </span>

              <span className="font-semibold">

                {loading ? "--" : stats.totalClassrooms}

              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-[#7A726B]">

                Scheduled Exams

              </span>

              <span className="font-semibold">

                {loading ? "--" : stats.totalExams}

              </span>

            </div>

            <div>

              <div className="mb-2 flex justify-between text-sm">

                <span className="text-[#7A726B]">

                  Capacity Utilization

                </span>

                <span className="font-medium">

                  72%

                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#ECE4DD]">

                <div
                  className="h-full rounded-full bg-[#2F3E46]"
                  style={{ width: "72%" }}
                />

              </div>

            </div>

          </div>

        </Card>

      </div> 

          </div>
  );
};

export default Dashboard; 