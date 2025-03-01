import { CommitCardProps } from '@/app/types/github';
import Image from 'next/image';
import { CheckCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

export function CommitCard({ activity, isSelected, onSelect }: CommitCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg transition-colors ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src={activity.author.avatar_url}
            alt={activity.author.login}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <span className="font-medium dark:text-white">{activity.author.login}</span>
            <span className={`text-sm px-2 py-1 rounded ${
              activity.type === 'pull' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            }`}>
              {activity.type}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.commit.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {new Date(activity.commit.author.date).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => onSelect(activity.sha)}
          className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          {isSelected ? (
            <CheckCircleIcon className="w-6 h-6 text-blue-500" />
          ) : (
            <PlusCircleIcon className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
} 