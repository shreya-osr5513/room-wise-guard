import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  DoorOpen,
  Gauge,
  Sparkles,
  Thermometer,
  TriangleAlert,
  UsersRound,
  Wifi,
} from "lucide-react";
import { RoomCard } from "@/components/RoomCard";
import { StatCard } from "@/components/StatCard";
import { Badge, Button, Card, SectionTitle } from "@/components/ui-kit";
import { useBuilding } from "@/context/AppProvider";
import { isWasting, timeAgo, wastageMessage } from "@/lib/format";
import { computeOverview } from "@/services/api";

export const Route = createFileRoute("/_dash/overview")({
  head: () => ({
    meta: [
      { title: "Overview — SmartBuild OS Building Monitoring" },
      {
        name: "description",
        content:
          "Live building overview: occupancy, energy alerts, average temperature and device health across every monitored room.",
      },
      { property: "og:title", content: "Overview — SmartBuild OS" },
      {
        property: "og:description",
        content: "Live occupancy, energy and device health for your smart building.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const { rooms, alerts, activity, recommendations, loading, turnAllOff } = useBuilding();
  const stats = computeOverview(rooms, alerts);
  const wasting = rooms.filter(isWasting);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading building data…</p>;
  }

  const statusTone =
    stats.buildingStatus === "optimal"
      ? "success"
      : stats.buildingStatus === "attention"
        ? "warning"
        : "danger";

  return (
    <div className="space-y-6">
      <Card className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Building status
          </p>
          <p className="font-display mt-1 text-xl font-semibold capitalize sm:text-2xl">
            {stats.buildingStatus === "optimal"
              ? "All systems optimal"
              : stats.buildingStatus === "attention"
                ? "Needs attention"
                : "Critical issues detected"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.devicesOnline}/{stats.totalRooms} nodes reporting ·{" "}
            {alerts.filter((a) => a.status === "active").length} active alerts
          </p>
        </div>
        <Badge tone={statusTone} dot className="shrink-0">
          {stats.buildingStatus.toUpperCase()}
        </Badge>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={Building2} label="Total rooms" value={stats.totalRooms} />
        <StatCard
          icon={UsersRound}
          label="Occupied"
          value={stats.occupiedRooms}
          tone="success"
        />
        <StatCard icon={DoorOpen} label="Empty" value={stats.emptyRooms} tone="warning" />
        <StatCard
          icon={TriangleAlert}
          label="Energy alerts"
          value={stats.energyAlerts}
          tone="danger"
        />
        <StatCard
          icon={Thermometer}
          label="Avg temperature"
          value={`${stats.averageTemperature} °C`}
        />
        <StatCard
          icon={Wifi}
          label="Devices online"
          value={stats.devicesOnline}
          hint={`${stats.devicesOffline} offline`}
          tone="success"
        />
        <StatCard
          icon={Gauge}
          label="Automation"
          value={rooms.filter((r) => r.mode === "automatic").length}
          hint="rooms in automatic mode"
        />
        <StatCard
          icon={Sparkles}
          label="AI insights"
          value={recommendations.length}
          hint="new recommendations"
        />
      </div>

      {wasting.length > 0 ? (
        <div>
          <SectionTitle
            title="Energy wastage detected"
            subtitle="Empty rooms with appliances still running"
          />
          <div className="space-y-3">
            {wasting.map((room) => (
              <Card
                key={room.id}
                className="grid gap-3 border-danger/30 bg-danger/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <p className="min-w-0 text-sm">{wastageMessage(room)}</p>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => void turnAllOff(room.id)}>
                    Turn all off
                  </Button>
                  <Link to="/rooms/$roomId" params={{ roomId: room.id }}>
                    <Button size="sm" variant="outline">
                      View room
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <SectionTitle
            title="Rooms"
            subtitle="Live telemetry from ESP32 nodes"
            action={
              <Link to="/rooms">
                <Button size="sm" variant="outline">
                  View all
                </Button>
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.slice(0, 4).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionTitle title="AI recommendations" subtitle="Mock ML predictions" />
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <p className="min-w-0 text-sm font-medium">{rec.title}</p>
                    <Badge tone="teal">{Math.round(rec.confidence * 100)}%</Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{rec.detail}</p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle title="Recent activity" />
            <Card className="space-y-3 p-4">
              {activity.slice(0, 6).map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal" />
                  <div className="min-w-0">
                    <p className="text-sm">{entry.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(entry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
