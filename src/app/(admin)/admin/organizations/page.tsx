import { Building2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrapper } from "@/components/ui/table";

const organizations = [
  { name: "CityCare Health", slug: "citycare" },
  { name: "Wellness First Clinic", slug: "wellness-first" },
];

export default function OrganizationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>Network organizations onboarded to the healthcare platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.slug}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="text-muted">{org.slug}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Enterprise
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      </CardContent>
    </Card>
  );
}
