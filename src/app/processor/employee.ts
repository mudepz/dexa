import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Job } from "bullmq";
import { InfraService } from "../../infra/infra.service";
import { RepoService } from "../../repo/repo.service";
import { EmployeeLog } from "../dto/employee";

@Processor('employee')
export class EmployeeProcessor extends WorkerHost {
    constructor(
        private readonly repo: RepoService,
        private readonly infra: InfraService,
    ) {
        super();
    }

    async process(job: Job) {
        switch (job.name) {
            case 'log':
                this.log(job)
                break;
            default:
                Logger.error(`Job ${job.name} dont have processor`, 'EP-P-01');
                break;
        }
    }

    async log(job: Job) {
        try {
            const employeeLog = job.data as EmployeeLog;
            let oldValue = employeeLog.old_value ? JSON.parse(employeeLog.old_value) : undefined;
            let newValue = employeeLog.new_value ? JSON.parse(employeeLog.new_value) : undefined;

            if (employeeLog.old_value && employeeLog.new_value) {
                function getNestedChanges(oldObj: any, newObj: any) {
                    const oldChanges: any = {};
                    const newChanges: any = {};

                    for (const key in newObj) {
                        if (
                            typeof newObj[key] === 'object' &&
                            newObj[key] !== null &&
                            oldObj[key] !== null &&
                            typeof oldObj[key] === 'object'
                        ) {
                            const { old: nestedOld, new: nestedNew } = getNestedChanges(oldObj[key], newObj[key]);
                            if (Object.keys(nestedNew).length) {
                                oldChanges[key] = nestedOld;
                                newChanges[key] = nestedNew;
                            }
                        } else if (newObj[key] !== oldObj[key]) {
                            oldChanges[key] = oldObj[key];
                            newChanges[key] = newObj[key];
                        }
                    }

                    return { old: oldChanges, new: newChanges };
                }

                const { old: oldChanged, new: newChanged } = getNestedChanges(oldValue, newValue);
                oldValue = oldChanged;
                newValue = newChanged;
            }

            const log = await this.repo.db.employeeLog.insert(null, {
                timestamp: employeeLog.timestamp,
                old_value: oldValue,
                new_value: newValue,
                employee: {
                    connect: {
                        id: employeeLog.employee_id,
                    }
                }
            })

            this.infra.websocket.broadcast('profile-update', log)
        } catch (e) {
            Logger.error(e instanceof Error ? e.stack : e, 'EP-L-01');
        }
    }
}