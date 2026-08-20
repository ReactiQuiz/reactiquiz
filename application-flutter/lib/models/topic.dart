class Topic {
  final String id;
  final String name;
  final String description;
  final String className;
  final String genre;
  final String subjectId; // Changed from subject to subjectId
  final String? subjectKey; // Optional subject key

  Topic({
    required this.id,
    required this.name,
    required this.description,
    required this.className,
    required this.genre,
    required this.subjectId,
    this.subjectKey,
  });

  factory Topic.fromJson(Map<String, dynamic> json) {
    return Topic(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      description: (json['description'] as String?) ?? '',
      className: (json['class'] ?? json['className'] ?? '').toString(),
      genre: (json['genre'] ?? '').toString(),
      subjectId: (json['subject_id'] ?? json['subjectId'] ?? '').toString(),
      subjectKey: json['subjectKey']?.toString() ?? json['subject_key']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'class': className,
      'genre': genre,
      'subject_id': subjectId,
      if (subjectKey != null) 'subjectKey': subjectKey,
    };
  }
}

