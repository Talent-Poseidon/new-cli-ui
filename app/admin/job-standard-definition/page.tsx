"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface JobStandard {
  id: string;
  jobName: string;
  scoreExpectation: number;
  createdAt: string;
}

export default function JobStandardDefinitionPage() {
  const [jobStandards, setJobStandards] = useState<JobStandard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [jobName, setJobName] = useState<string>("");
  const [scoreExpectation, setScoreExpectation] = useState<string>("");
  const [alert, setAlert] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });

  useEffect(() => {
    fetch("/api/job-standards")
      .then((res: Response) => res.json())
      .then((data: JobStandard[]) => {
        setJobStandards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    if (!jobName) {
      setAlert({ type: "error", message: "Job name is required" });
      return;
    }

    if (!scoreExpectation) {
      setAlert({ type: "error", message: "Score expectation is required" });
      return;
    }

    const score = Number(scoreExpectation);
    if (isNaN(score)) {
      setAlert({
        type: "error",
        message: "Score expectation must be a number",
      });
      return;
    }

    try {
      const res = await fetch("/api/job-standards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobName, scoreExpectation: score }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      const created: JobStandard = await res.json();
      setJobStandards((prev: JobStandard[]) => [created, ...prev]);
      setAlert({
        type: "success",
        message: "Score expectations saved successfully",
      });
      setJobName("");
      setScoreExpectation("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Save failed";
      setAlert({ type: "error", message });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Job Standard Definition
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define job standards and set score expectations.
        </p>
      </div>

      <Separator />

      {alert.message && (
        <div
          data-testid={
            alert.type === "success"
              ? "job-standard-created-alert"
              : "job-standard-error-alert"
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
          <h2 className="font-semibold">Set Score Expectations</h2>
        </CardHeader>
        <CardContent>
          <form
            data-testid="job-standard-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium" htmlFor="jobName">
                Job Name
              </label>
              <Input
                id="jobName"
                name="jobName"
                data-testid="job-name-input"
                placeholder="Enter job name"
                value={jobName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setJobName(e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="scoreExpectation">
                Score Expectation
              </label>
              <Input
                id="scoreExpectation"
                name="scoreExpectation"
                data-testid="score-expectation-input"
                type="number"
                placeholder="Enter score expectation"
                value={scoreExpectation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setScoreExpectation(e.target.value)
                }
              />
            </div>
            <Button type="submit" data-testid="save-score-btn">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <div data-testid="job-standard-list-container">
        {loading ? (
          <p data-testid="job-standard-list-loading">Loading job standards...</p>
        ) : jobStandards.length > 0 ? (
          <div className="grid gap-4" data-testid="job-standard-list">
            {jobStandards.map((js: JobStandard) => (
              <Card key={js.id} data-testid={`job-standard-item-${js.id}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{js.jobName}</p>
                      <p className="text-sm text-muted-foreground">
                        Score Expectation: {js.scoreExpectation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p
            data-testid="job-standard-list-empty"
            className="text-muted-foreground"
          >
            No job standards defined yet.
          </p>
        )}
      </div>
    </div>
  );
}
