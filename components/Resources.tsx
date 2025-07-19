import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, Award, Globe, Heart, FileText, Download } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ResourcesPage() {

  const resources = [
    { title: "Club Constitution & Bylaws", icon: <FileText className="h-5 w-5" />, type: "PDF" },
    { title: "Membership Application", icon: <FileText className="h-5 w-5" />, type: "PDF" },
    { title: "Club Handbook", icon: <FileText className="h-5 w-5" />, type: "PDF" },
    { title: "Code of Conduct", icon: <FileText className="h-5 w-5" />, type: "PDF" },
    { title: "Meeting Minutes Archive", icon: <FileText className="h-5 w-5" />, type: "Archive" },
    { title: "Club Brochure", icon: <FileText className="h-5 w-5" />, type: "PDF" }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Resources */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Resources & Documents</h2>
            <p className="text-muted-foreground">Important club documents and resources</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {resource.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{resource.title}</h3>
                        <p className="text-xs text-muted-foreground">{resource.type}</p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}