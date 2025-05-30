
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setError(null);
    setDetails(null);

    try {
      console.log('Testing Supabase connection...');
      
      // Test 1: Basic connection
      const { data, error: healthError } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact', head: true });

      if (healthError) {
        throw new Error(`Database connection failed: ${healthError.message}`);
      }

      // Test 2: Auth status
      const { data: { session } } = await supabase.auth.getSession();
      
      // Test 3: Get user info if logged in
      let userProfile = null;
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        userProfile = profile;
      }

      setDetails({
        profilesTableAccessible: true,
        currentUser: session?.user || null,
        userProfile: userProfile,
        supabaseUrl: 'https://eghaglafhlqajdktorjb.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Truncated for security
      });

      setConnectionStatus('connected');
      console.log('Supabase connection test successful');
    } catch (err: any) {
      console.error('Supabase connection test failed:', err);
      setError(err.message);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Supabase Connection Test
          {connectionStatus === 'testing' && <Loader2 className="w-5 h-5 animate-spin" />}
          {connectionStatus === 'connected' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {connectionStatus === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <strong>Status:</strong>
          <span className={`px-2 py-1 rounded text-sm ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'error' ? 'Error' : 'Testing...'}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <strong className="text-red-800">Error:</strong>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {details && (
          <div className="space-y-2">
            <h4 className="font-semibold">Connection Details:</h4>
            <div className="p-3 bg-gray-50 rounded text-sm space-y-1">
              <p><strong>Supabase URL:</strong> {details.supabaseUrl}</p>
              <p><strong>API Key:</strong> {details.supabaseKey}</p>
              <p><strong>Profiles Table:</strong> {details.profilesTableAccessible ? '✅ Accessible' : '❌ Not accessible'}</p>
              <p><strong>Current User:</strong> {details.currentUser ? `✅ ${details.currentUser.email}` : '❌ Not logged in'}</p>
              <p><strong>User Profile:</strong> {details.userProfile ? `✅ Found (${details.userProfile.name})` : '❌ Not found'}</p>
            </div>
          </div>
        )}

        <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Again'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;
