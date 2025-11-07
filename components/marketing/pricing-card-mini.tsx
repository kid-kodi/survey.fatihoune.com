import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

export interface PricingCardMiniProps {
  name: string;
  price: string;
  feature: string;
  ctaText: string;
  ctaHref: string;
  isCurrentPlan?: boolean;
  isMostPopular?: boolean;
}

export function PricingCardMini({
  name,
  price,
  feature,
  ctaText,
  ctaHref,
  isCurrentPlan = false,
  isMostPopular = false,
}: PricingCardMiniProps) {
  return (
    <Card className={`relative flex flex-col ${isCurrentPlan ? "border-primary border-2" : ""} ${isMostPopular ? "border-primary" : ""}`}>
      {isMostPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      {isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="secondary">
          Current Plan
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription className="text-3xl font-bold mt-2">
          {price}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{feature}</p>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={ctaHref} className="w-full">
          <Button
            className="w-full"
            variant={isMostPopular ? "default" : "outline"}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? "Current Plan" : ctaText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
