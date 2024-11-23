'use client';

import Image from 'next/image';
import { UserActivity } from '@/app/types/github';

interface UserActivitiesListProps {
  activities: UserActivity[];
  username: string;
}

export function UserActivitiesList({ activities, username }: UserActivitiesListProps) {
  if (activities.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold dark:text-white mb-4">
        Activities for {username}
      </h2>
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-4">
            <Image
              src={activity.actor.avatar_url}
              alt={activity.actor.login}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium dark:text-white">
                  {activity.type}
                  {activity.payload.commits?.[0]?.message && 
                    ` - ${activity.payload.commits[0].message}`
                  }
                  {activity.payload.pull_request?.title && 
                    ` - ${activity.payload.pull_request.title}`
                  }
                  {activity.payload.issue?.title && 
                    ` - ${activity.payload.issue.title}`
                  }
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
              <a 
                href={`https://github.com/${activity.repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                {activity.repo.name}
              </a>
              {activity.payload.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {activity.payload.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 