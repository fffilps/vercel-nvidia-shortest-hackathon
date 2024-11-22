import { CommitCardProps } from '@/app/types/github';
import Image from 'next/image';

export function CommitCard({ activity, isSelected, onSelect }: CommitCardProps) {
  return (
    <div
      className={`p-4 border dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
      }`}
      onClick={() => onSelect(activity.sha)}
    >
      <div className="flex items-center gap-2">
        <Image
          src={activity.author?.avatar_url}
          alt={activity.author?.login}
          className="w-8 h-8 rounded-full"
          width={32}
          height={32}
        />
        <div>
          <span className="font-medium dark:text-white">{activity.author?.login}</span>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activity.commit.message}
          </p>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        <a 
          href={activity.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline dark:text-blue-400"
        >
          {activity.sha.substring(0, 7)}
        </a>
        <span className="mx-2">•</span>
        <span>
          {new Date(activity.commit.author.date).toLocaleString()}
        </span>
      </div>
    </div>
  );
} 