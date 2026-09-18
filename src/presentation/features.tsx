import { MessageSquareQuote, Store, Utensils } from "lucide-react";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  body: string;
}

function FeatureCard({
  icon,
  title,
  body,
}: FeatureCardProps) {
  return (
    <div className="landing-reveal flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-md shadow-primary/5 transition duration-300 ease-out hover:-translate-y-2 hover:border-primary/60 hover:bg-secondary hover:shadow-xl hover:shadow-primary/15">
      <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <span aria-hidden="true" className="text-3xl">
          {icon}
        </span>
        {title}
      </h3>

      <p className="text-sm text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
}

const features: Feature[] = [
  {
    icon: <Store />,
    title: "Mga Lokal na Kainan",
    body: "Hanapin kung saan masarap kumain sa San Pedro. Tingnan kung ano ang patok at kung saan nagpupunta ang iyong mga kaibigan.",
  },
  {
    icon: <Utensils />,
    title: "Mga Tradisyonal na Lutuin",
    body: "Alamin ang mga pagkaing bahagi ng San Pedro, pati ang mga resipe, kuwento, at natatanging katangian ng mga ito.",
  },
  {
    icon: <MessageSquareQuote />,
    title: "Tunay na mga Pagsusuri",
    body: "Basahin ang tunay na opinyon ng mga tao. Mag-iwan ng iyong pagsusuri at tulungan ang iba na makahanap ng masarap na pagkain.",
  },
];

export default function LandingFeatures() {
  return (
    <div className="mb-16 grid w-full gap-2 md:grid-cols-3 md:gap-8">
      {features.map((feature) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          body={feature.body}
        />
      ))}
    </div>
  );
}