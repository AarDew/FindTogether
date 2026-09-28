import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Image } from 'lucide-react';
import { FaceMatch } from '@/types/FaceMatch';

interface MatchBadgeProps {
  match?: FaceMatch | null;
  className?: string;
}

const MatchBadge: React.FC<MatchBadgeProps> = ({ match, className = "" }) => {
  if (!match) {
    return (
      <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
        <Clock className="w-3 h-3" />
        No matches
      </Badge>
    );
  }

  const getVariant = () => {
    if (match.status === 'verified') return 'default';
    if (match.status === 'rejected') return 'destructive';
    return 'secondary';
  };

  const getIcon = () => {
    if (match.status === 'verified') return <CheckCircle className="w-3 h-3" />;
    if (match.status === 'rejected') return <AlertCircle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const getLabel = () => {
    const confidence = Math.round(match.confidence * 100);
    if (match.status === 'verified') return `Verified Match (${confidence}%)`;
    if (match.status === 'rejected') return 'False Match';
    return `Pending Review (${confidence}%)`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Badge variant={getVariant()} className="flex items-center gap-1">
        {getIcon()}
        {getLabel()}
      </Badge>
      
      {match.thumbnail_url && (
        <div className="relative group">
          <img
            src={match.thumbnail_url}
            alt="Matched face"
            className="w-16 h-16 rounded-lg object-cover border border-border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
            <Image className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}
      
      {match.processing_status !== 'completed' && (
        <Badge variant="outline" className="text-xs">
          Processing...
        </Badge>
      )}
    </div>
  );
};

export default MatchBadge;