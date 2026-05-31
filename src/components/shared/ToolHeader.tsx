import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';
import { AIConfigPanel } from './AIConfigPanel';
import { type APIConfig } from '@/lib/browserApiService';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  showSettings: boolean;
  onToggleSettings: () => void;
  apiConfig: APIConfig;
  setApiConfig: (config: APIConfig) => void;
  configPanelClassName?: string;
}

const ToolHeader: React.FC<ToolHeaderProps> = ({
  title,
  description,
  icon,
  showSettings,
  onToggleSettings,
  apiConfig,
  setApiConfig,
  configPanelClassName,
}) => (
  <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSettings}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardHeader>
    </Card>

    {showSettings && (
      <AIConfigPanel
        config={apiConfig}
        setConfig={setApiConfig}
        onClose={onToggleSettings}
        className={configPanelClassName}
      />
    )}
  </>
);

export default ToolHeader;
