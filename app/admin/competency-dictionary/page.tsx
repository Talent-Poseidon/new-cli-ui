"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";

interface CompetencyTemplate {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

export default function CompetencyDictionaryPage() {
  const [templates, setTemplates] = useState<CompetencyTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });

  useEffect(() => {
    fetch("/api/competency-templates")
      .then((res: Response) => res.json())
      .then((data: CompetencyTemplate[]) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUploadTemplate = async () => {
    setUploading(true);
    setAlert({ type: "", message: "" });

    try {
      const templateName = `Template ${Date.now()}`;
      const res = await fetch("/api/competency-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          fileName: `${templateName}.xlsx`,
          fileUrl: `/uploads/${templateName}.xlsx`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload template");
      }

      const created: CompetencyTemplate = await res.json();
      setTemplates((prev: CompetencyTemplate[]) => [created, ...prev]);
      setAlert({
        type: "success",
        message: "Template uploaded successfully",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setAlert({ type: "error", message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Competency Dictionary Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage competency dictionaries and upload templates.
          </p>
        </div>
        <Button
          data-testid="upload-template-btn"
          onClick={handleUploadTemplate}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Template"}
        </Button>
      </div>

      <Separator />

      {alert.message && (
        <div
          data-testid={
            alert.type === "success"
              ? "template-created-alert"
              : "template-error-alert"
          }
          className={`rounded-lg border p-4 text-sm ${
            alert.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {alert.message}
        </div>
      )}

      <div data-testid="template-list">
        {loading ? (
          <p data-testid="template-list-loading">Loading templates...</p>
        ) : templates.length > 0 ? (
          <div className="grid gap-4">
            {templates.map((template: CompetencyTemplate) => (
              <Card
                key={template.id}
                data-testid={`template-item-${template.id}`}
              >
                <CardHeader className="pb-2">
                  <h3 className="font-semibold">{template.name}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    File: {template.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded:{" "}
                    {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p data-testid="template-list-empty" className="text-muted-foreground">
            No templates uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
