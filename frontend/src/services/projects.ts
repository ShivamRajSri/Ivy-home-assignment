import type { Project } from "@/types/project";
import projectsData from "@/data/projects.json";

const projects = projectsData as Project[];

export interface ProjectFilters {
  search?: string;
  locality?: string;
  status?: string;
}

export interface ProjectResponse {
  results: Project[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export const projectsService = {
  getProjects(
    filters: ProjectFilters = {},
    offset = 0,
    limit = 12,
  ): ProjectResponse {
    let rows = [...projects];

    if (filters.search) {
      const query = filters.search.toLowerCase().trim();

      rows = rows.filter((project) =>
        [
          project.apartment_name,
          project.developer_name,
          project.locality,
          project.project_status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query),
          ),
      );
    }

    if (filters.locality) {
      rows = rows.filter(
        (project) =>
          project.locality.toLowerCase() ===
          filters.locality!.toLowerCase(),
      );
    }

    if (filters.status) {
      rows = rows.filter(
        (project) =>
          project.project_status?.toLowerCase() ===
          filters.status!.toLowerCase(),
      );
    }

    const total = rows.length;

    const results = rows.slice(
      offset,
      offset + limit,
    );

    return {
      results,
      total,
      offset,
      limit,
      has_more: offset + limit < total,
    };
  },
};