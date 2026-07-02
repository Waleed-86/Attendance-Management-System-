<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #171a19; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        p.subtitle { color: #545b5a; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #eceeee; padding: 8px; text-align: left; }
        th { background-color: #eef7f6; }
    </style>
</head>
<body>
    <h1>Attendance Report</h1>
    <p class="subtitle">{{ $from }} to {{ $to }}</p>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Leave</th>
                <th>Percentage</th>
                <th>Grade</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
                <tr>
                    <td>{{ $row['user']['name'] }}</td>
                    <td>{{ $row['user']['email'] }}</td>
                    <td>{{ $row['present'] }}</td>
                    <td>{{ $row['absent'] }}</td>
                    <td>{{ $row['leave'] }}</td>
                    <td>{{ $row['percentage'] }}%</td>
                    <td>{{ $row['grade'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>