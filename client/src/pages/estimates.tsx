import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstimateForm } from "@/components/admin/estimate-form";
import { EstimatesList } from "@/components/admin/estimates-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, FileText, Plus, List } from "lucide-react";

export function EstimatesPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Estimates</h1>
          <p className="text-gray-600">Create and manage jewelry estimates for your customers</p>
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