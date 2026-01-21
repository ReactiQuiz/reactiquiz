class Subject {
  final String id;
  final String name;
  final String description;
  final String iconName;
  final int displayOrder;
  final String subjectKey;
  final String accentColorDark;
  final String accentColorLight;

  Subject({
    required this.id,
    required this.name,
    required this.description,
    required this.iconName,
    required this.displayOrder,
    required this.subjectKey,
    required this.accentColorDark,
    required this.accentColorLight,
  });

  factory Subject.fromJson(Map<String, dynamic> json) {
    // Handle both camelCase and snake_case field names
    return Subject(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      iconName: (json['iconName'] ?? json['icon_name'] ?? 'default').toString(),
      displayOrder: (json['displayOrder'] ?? json['display_order'] ?? 0) as int? ?? 0,
      subjectKey: (json['subjectKey'] ?? json['subject_key'] ?? '').toString(),
      accentColorDark: (json['accentColorDark'] ?? json['accent_color_dark'] ?? '#2196F3').toString(),
      accentColorLight: (json['accentColorLight'] ?? json['accent_color_light'] ?? '#1976D2').toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'iconName': iconName,
      'displayOrder': displayOrder,
      'subjectKey': subjectKey,
      'accentColorDark': accentColorDark,
      'accentColorLight': accentColorLight,
    };
  }
}

