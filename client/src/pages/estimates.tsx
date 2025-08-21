import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstimateForm } from "@/components/admin/estimate-form";
import { EstimatesList } from "@/components/admin/estimates-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, FileText, Plus, List, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export function EstimatesPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [location, setLocation] = useLocation();
  
  // Handle URL tab parameter
  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');
    if (tabParam === 'list' || tabParam === 'create') {
      setActiveTab(tabParam);
    }
  }, [location]);

  return (
    <div className="min-h-screen luxury-bg py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin')}
            className="mb-4 text-luxury-black hover:bg-champagne/20 border border-gold/30"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-luxury-black mb-2">Customer Estimates</h1>
            <p className="text-medium-grey">Create and manage jewelry estimates for your customers</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>View Estimates</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Estimate</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <EstimatesList />
          </TabsContent>

          <TabsContent value="create">
            <EstimateForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}