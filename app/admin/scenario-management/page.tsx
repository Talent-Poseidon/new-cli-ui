"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Scenario {
  id: string;
  name: string;
  createdAt: string;
}

export default function ScenarioManagementPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scenarioName, setScenarioName] = useState<string>("");
  const [alert, setAlert] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });

  useEffect(() => {
    fetch("/api/scenarios")
      .then((res: Response) => res.json())
      .then((data: Scenario[]) => {
        setScenarios(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!scenarioName) {
      setAlert({ type: "error", message: "Scenario name is required" });
      return;
    }

    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: scenarioName }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save scenario");
      }

      const created: Scenario = await res.json();
      setScenarios((prev: Scenario[]) => [created, ...prev]);
      setAlert({
        type: "success",
        message: "Scenario saved successfully",
      });
      setScenarioName("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Save failed";
      setAlert({ type: "error", message });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Scenario Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure and manage exam scenarios.
        </p>
      </div>

      <Separator />

      {alert.message && (
        <div
          data-testid={
            alert.type === "success"
              ? "scenario-created-alert"
              : "scenario-error-alert"
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

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Configure Exam Scenario</h2>
        </CardHeader>
        <CardContent>
          <form
            data-testid="scenario-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium" htmlFor="scenarioName">
                Scenario Name
              </label>
              <Input
                id="scenarioName"
                name="scenarioName"
                data-testid="scenario-name-input"
                placeholder="Enter scenario name"
                value={scenarioName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setScenarioName(e.target.value)
                }
              />
            </div>
            <Button type="submit" data-testid="save-scenario-btn">
              Save Scenario
            </Button>
          </form>
        </CardContent>
      </Card>

      <div data-testid="scenario-list-container">
        {loading ? (
          <p data-testid="scenario-list-loading">Loading scenarios...</p>
        ) : scenarios.length > 0 ? (
          <div className="grid gap-4" data-testid="scenario-list">
            {scenarios.map((scenario: Scenario) => (
              <Card
                key={scenario.id}
                data-testid={`scenario-item-${scenario.id}`}
              >
                <CardContent className="pt-4">
                  <p className="font-semibold">{scenario.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Created:{" "}
                    {new Date(scenario.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p
            data-testid="scenario-list-empty"
            className="text-muted-foreground"
          >
            No scenarios configured yet.
          </p>
        )}
      </div>
    </div>
  );
}
