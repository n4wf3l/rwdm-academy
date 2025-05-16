import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Chart as ChartJS,
} from "chart.js";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

interface AdminStatsRequest {
  id: string;
  type: string;
  status: string;
  assignedTo: string;
  date: string; // format ISO
}

interface Props {
  requests: AdminStatsRequest[];
}

const AdminMonthlyChart: React.FC<Props> = ({ requests }) => {
  const { t } = useTranslation();
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];

  const completedRequests = requests.filter(
    (r) => r.status === "completed" || r.status === "Terminé"
  );

  const admins = Array.from(
    new Set(completedRequests.map((r) => r.assignedTo))
  );

  const dataPerAdmin: Record<string, number[]> = {};
  admins.forEach((admin) => {
    dataPerAdmin[admin] = new Array(12).fill(0);
  });

  completedRequests.forEach((req) => {
    const monthIndex = new Date(req.date).getMonth();
    if (dataPerAdmin[req.assignedTo]) {
      dataPerAdmin[req.assignedTo][monthIndex]++;
    }
  });

  const chartData = {
    labels: months,
    datasets: admins.map((admin, i) => ({
      label: admin,
      data: dataPerAdmin[admin],
      borderColor: `hsl(${(i * 60) % 360}, 70%, 50%)`,
      backgroundColor: `hsla(${(i * 60) % 360}, 70%, 50%, 0.4)`,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: t("chart.completedByMonth.title"),
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("chart.byAdminAndMonth.subtitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4">
            <Line data={chartData} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminMonthlyChart;
