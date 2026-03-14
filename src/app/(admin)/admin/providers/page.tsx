import { ShieldPlus } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrapper } from "@/components/ui/table";

const providers = [
  { name: "Dr. Sarah Walker", specialty: "Cardiology" },
  { name: "Dr. Eric James", specialty: "General Medicine" },
];

export default function ProvidersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Providers</CardTitle>
        <CardDescription>Credentialed providers currently available in the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.name}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell className="text-muted">{provider.specialty}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                      <ShieldPlus className="h-3.5 w-3.5" aria-hidden="true" />
                      Active
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
