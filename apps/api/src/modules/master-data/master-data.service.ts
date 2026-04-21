import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

type ResourceName =
  | "batch"
  | "academicYear"
  | "class"
  | "student"
  | "staff"
  | "parent"
  | "subject"
  | "lessonPeriod"
  | "classSchedule"
  | "studentClassEnrollment";

@Injectable()
export class MasterDataService {
  constructor(private readonly prisma: PrismaService) {}

  private queryOptions(resource: ResourceName) {
    switch (resource) {
      case "class":
        return {
          include: {
            batch: true,
            academicYear: true,
            homeroomStaff: true
          }
        };
      case "student":
        return {
          include: {
            batch: true,
            enrollments: {
              where: { isActive: true },
              include: {
                class: true
              }
            }
          }
        };
      case "staff":
        return {
          include: {
            user: true,
            positions: {
              include: {
                position: true
              }
            }
          }
        };
      case "parent":
        return {
          include: {
            user: true,
            students: {
              include: {
                student: true
              }
            }
          }
        };
      case "classSchedule":
        return {
          include: {
            academicYear: true,
            class: true,
            subject: true,
            teacher: true,
            lessonPeriod: true
          }
        };
      case "studentClassEnrollment":
        return {
          include: {
            student: true,
            class: {
              include: {
                batch: true,
                academicYear: true
              }
            }
          }
        };
      default:
        return {};
    }
  }

  private delegate(resource: ResourceName): any {
    return this.prisma[resource as keyof PrismaService];
  }

  list(resource: ResourceName) {
    return this.delegate(resource).findMany(this.queryOptions(resource));
  }

  get(resource: ResourceName, where: Record<string, unknown>) {
    return this.delegate(resource).findUnique({
      where,
      ...this.queryOptions(resource)
    });
  }

  create(resource: ResourceName, data: Record<string, unknown>) {
    return this.delegate(resource).create({ data });
  }

  update(resource: ResourceName, where: Record<string, unknown>, data: Record<string, unknown>) {
    return this.delegate(resource).update({ where, data });
  }

  async remove(resource: ResourceName, where: Record<string, unknown>) {
    const found = await this.delegate(resource).findUnique({ where });
    if (!found) {
      throw new NotFoundException("Resource not found.");
    }

    return this.delegate(resource).delete({ where });
  }

  createEnrollment(data: Record<string, unknown>) {
    return this.create("studentClassEnrollment", data);
  }

  updateEnrollment(id: string, data: Record<string, unknown>) {
    return this.update("studentClassEnrollment", { id }, data);
  }

  listEnrollments() {
    return this.list("studentClassEnrollment");
  }

  getEnrollment(id: string) {
    return this.get("studentClassEnrollment", { id });
  }

  deleteEnrollment(id: string) {
    return this.remove("studentClassEnrollment", { id });
  }

  linkParentToStudent(parentId: string, studentId: string, relationship: string, isPrimary = false) {
    return this.prisma.parentStudentLink.create({
      data: {
        parentId,
        studentId,
        relationship,
        isPrimary
      }
    });
  }
}
