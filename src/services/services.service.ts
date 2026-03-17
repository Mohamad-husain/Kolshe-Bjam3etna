import { apiClient } from "./api-client";
import { ServiceCardData } from "@src/components/explore/ServiceCard";

type ApiServiceRequest = {
  id: number;
  title: string;
  budget: number;
  deadlineUtc: string;
  description: string;
  categoryId: number;
  categoryName: string;
  attachmentsCount: number;
  user: {
    fullName: string;
    profileImageUrl: string | null;
  };
};

function formatDeadline(deadlineUtc: string): string {
  const deadline = new Date(deadlineUtc);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "انتهى";
  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "يوم واحد";
  if (diffDays <= 6) return `${diffDays} أيام`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} أسابيع`;
  return `${Math.ceil(diffDays / 30)} أشهر`;
}

function mapToServiceCard(item: ApiServiceRequest): ServiceCardData {
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    category: item.categoryName,
    pricePerHour: item.budget,
    deadline: formatDeadline(item.deadlineUtc),
    owner: {
      name: item.user.fullName,
      rating: 0,
      initials: item.user.fullName.charAt(0),
    },
  };
}

export async function getServiceRequests(): Promise<ServiceCardData[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: ApiServiceRequest[];
  }>("/api/ServiceRequests");
  if (!data.data || data.data.length === 0) return [];
  return data.data.map(mapToServiceCard);
}
