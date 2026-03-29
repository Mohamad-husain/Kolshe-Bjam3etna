import { apiClient } from './http-client';
import { ServiceCardData } from "@/components/explore/ServiceCard";

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

  if (Number.isNaN(deadline.getTime()) || deadline.getFullYear() < 2000) {
    return 'غير محدد';
  }

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "انتهى";
  if (diffDays === 0) return "متبقي اليوم";
  if (diffDays === 1) return "متبقي يوم";
  if (diffDays <= 6) return `متبقي ${diffDays} أيام`;

  const diffWeeks = Math.ceil(diffDays / 7);
  if (diffDays <= 30) {
    return diffWeeks === 1 ? 'متبقي أسبوع' : `متبقي ${diffWeeks} أسابيع`;
  }

  const diffMonths = Math.ceil(diffDays / 30);
  return diffMonths === 1 ? 'متبقي شهر' : `متبقي ${diffMonths} أشهر`;
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
